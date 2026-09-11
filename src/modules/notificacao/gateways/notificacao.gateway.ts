import { Public } from '@common/decorators/public.decorator';
import { TokenServiceContract } from '@core/auth/contracts/token-service.contract';
import { AccessTokenPayload } from '@core/auth/types/access-token-payload';
import { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import {
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificacaoEventsService } from './notificacao-events.service';

type SocketEvents = Record<string, (...args: unknown[]) => void>;
type AuthenticatedSocket = Socket<
  SocketEvents,
  SocketEvents,
  SocketEvents,
  { user?: AuthenticatedUser }
>;

@Public()
@WebSocketGateway({
  namespace: '/notificacoes',
  transports: ['websocket', 'polling'],
})
export class NotificacaoGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    private readonly tokens: TokenServiceContract,
    private readonly events: NotificacaoEventsService,
  ) {}

  afterInit(server: Server): void {
    this.events.attach(server);
    server.use((socket, next) => {
      void this.autenticar(socket as AuthenticatedSocket)
        .then(() => next())
        .catch(() => next(new Error('Não autenticado.')));
    });
  }

  async handleConnection(socket: AuthenticatedSocket): Promise<void> {
    if (socket.data.user) return;

    try {
      await this.autenticar(socket);
    } catch {
      socket.disconnect(true);
    }
  }

  private async autenticar(socket: AuthenticatedSocket): Promise<void> {
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
    await socket.join(`usuario:${payload.sub}`);
  }
}
