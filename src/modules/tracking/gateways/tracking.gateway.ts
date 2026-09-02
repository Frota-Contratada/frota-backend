import { Public } from '@common/decorators/public.decorator';
import { TokenServiceContract } from '@core/auth/contracts/token-service.contract';
import { AccessTokenPayload } from '@core/auth/types/access-token-payload';
import { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { z } from 'zod';
import { TrackingPositionSchema } from '../controllers/dtos/request/tracking-position-request.dto';
import { TrackingService } from '../services/tracking.service';
import { TrackingEventsService } from '../services/tracking-events.service';

type SocketEvents = Record<string, (...args: unknown[]) => void>;
type AuthenticatedSocket = Socket<
  SocketEvents,
  SocketEvents,
  SocketEvents,
  { user?: AuthenticatedUser }
>;

const JoinSchema = z.object({
  tripId: z.coerce.number().int().positive(),
  role: z.enum(['driver', 'passenger']),
});
const LocationSchema = z.object({
  tripId: z.coerce.number().int().positive(),
  payload: TrackingPositionSchema,
});

@Public()
@WebSocketGateway({ transports: ['websocket', 'polling'] })
export class TrackingGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    private readonly tokens: TokenServiceContract,
    private readonly tracking: TrackingService,
    private readonly events: TrackingEventsService,
  ) {}

  afterInit(server: Server): void {
    this.events.attach(server);
    server.use((socket, next) => {
      void this.authenticate(socket as AuthenticatedSocket)
        .then(() => next())
        .catch(() => next(new Error('Não autenticado.')));
    });
  }

  async handleConnection(socket: AuthenticatedSocket): Promise<void> {
    if (socket.data.user) return;
    try {
      await this.authenticate(socket);
    } catch {
      socket.disconnect(true);
    }
  }

  private async authenticate(socket: AuthenticatedSocket): Promise<void> {
    const authorization = socket.handshake.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
      throw new WsException('Não autenticado.');
    }
    const token = authorization.slice('Bearer '.length);
    if (!(await this.tokens.validarAccessToken(token))) {
      throw new WsException('Não autenticado.');
    }
    const payload = await this.tokens.decodificar<AccessTokenPayload>(token);
    socket.data.user = {
      id: payload.sub,
      perfis: payload.perfis,
      filialId: payload.filialId,
      fornecedorId: payload.fornecedorId,
    };
  }

  @SubscribeMessage('trip.join')
  async join(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() input: unknown,
  ): Promise<{ ok: true; tripId: string }> {
    const user = this.requireUser(socket);
    const parsed = JoinSchema.safeParse(input);
    if (!parsed.success) throw new WsException('Payload de ingresso inválido.');
    await this.tracking.canAccess(parsed.data.tripId, user);
    await socket.join(`trip:${parsed.data.tripId}`);
    const response = { ok: true as const, tripId: String(parsed.data.tripId) };
    socket.emit('trip.joined', response);
    return response;
  }

  @SubscribeMessage('vehicle.location')
  async vehicleLocation(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() input: unknown,
  ): Promise<{ ok: true; accepted: boolean }> {
    const user = this.requireUser(socket);
    const parsed = LocationSchema.safeParse(input);
    if (!parsed.success) throw new WsException('Posição inválida.');
    const accepted = await this.tracking.saveVehiclePositions(
      parsed.data.tripId,
      user,
      [parsed.data.payload],
    );
    return { ok: true, accepted: accepted != null };
  }

  @SubscribeMessage('passenger.location')
  async passengerLocation(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() input: unknown,
  ): Promise<{ ok: true; accepted: boolean }> {
    const user = this.requireUser(socket);
    const parsed = LocationSchema.safeParse(input);
    if (!parsed.success) throw new WsException('Posição inválida.');
    const accepted = await this.tracking.savePassengerPosition(
      parsed.data.tripId,
      user,
      parsed.data.payload,
    );
    return { ok: true, accepted: accepted != null };
  }

  private requireUser(socket: AuthenticatedSocket): AuthenticatedUser {
    if (!socket.data.user) throw new WsException('Não autenticado.');
    return socket.data.user;
  }
}
