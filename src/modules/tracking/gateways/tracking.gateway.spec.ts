import { TrackingGateway } from './tracking.gateway';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';

describe('TrackingGateway', () => {
  const makeSocket = (
    headers: Record<string, string>,
    auth: Record<string, unknown>,
  ) => ({
    handshake: { headers, auth },
    data: {},
    disconnect: jest.fn(),
  });

  const makeGateway = () => {
    const tokens = {
      validarAccessToken: jest.fn().mockResolvedValue(true),
      decodificar: jest.fn().mockResolvedValue({
        sub: 10,
        perfis: [TipoPerfil.MOTORISTA],
        filialId: 2,
        fornecedorId: 3,
      }),
    };
    return {
      gateway: new TrackingGateway(tokens as never, {} as never, {} as never),
      tokens,
    };
  };

  it('authenticates a browser socket using handshake.auth.token', async () => {
    const { gateway, tokens } = makeGateway();
    const socket = makeSocket({}, { token: 'browser-test-token' });

    await gateway.handleConnection(socket as never);

    expect(tokens.validarAccessToken).toHaveBeenCalledWith(
      'browser-test-token',
    );
    expect(socket.data).toEqual({
      user: {
        id: 10,
        perfis: [TipoPerfil.MOTORISTA],
        filialId: 2,
        fornecedorId: 3,
      },
    });
    expect(socket.disconnect).not.toHaveBeenCalled();
  });

  it('continues to accept the Authorization header for non-browser clients', async () => {
    const { gateway, tokens } = makeGateway();
    const socket = makeSocket(
      { authorization: 'Bearer header-test-token' },
      {},
    );

    await gateway.handleConnection(socket as never);

    expect(tokens.validarAccessToken).toHaveBeenCalledWith('header-test-token');
    expect(socket.disconnect).not.toHaveBeenCalled();
  });

  it('rejects a socket without either token transport', async () => {
    const { gateway } = makeGateway();
    const socket = makeSocket({}, {});

    await gateway.handleConnection(socket as never);

    expect(socket.disconnect).toHaveBeenCalledWith(true);
  });

  it('does not bypass a malformed Authorization header using browser auth', async () => {
    const { gateway, tokens } = makeGateway();
    const socket = makeSocket(
      { authorization: 'invalid-header' },
      { token: 'browser-test-token' },
    );

    await gateway.handleConnection(socket as never);

    expect(socket.disconnect).toHaveBeenCalledWith(true);
    expect(tokens.validarAccessToken).not.toHaveBeenCalled();
  });

  it('confirma trip.join somente depois do ingresso efetivo na sala', async () => {
    let releaseJoin!: () => void;
    const joinBarrier = new Promise<void>((resolve) => {
      releaseJoin = resolve;
    });
    const socket = {
      data: { user: { id: 10, perfis: [TipoPerfil.MOTORISTA] } },
      join: jest.fn().mockReturnValue(joinBarrier),
      emit: jest.fn(),
    };
    const tracking = { canAccess: jest.fn().mockResolvedValue(undefined) };
    const gateway = new TrackingGateway(
      {} as never,
      tracking as never,
      {} as never,
    );

    let resolved = false;
    const resultPromise = gateway
      .join(socket as never, { tripId: '123', role: 'passenger' })
      .then((result) => {
        resolved = true;
        return result;
      });
    await Promise.resolve();
    expect(resolved).toBe(false);
    expect(socket.emit).not.toHaveBeenCalled();

    releaseJoin();
    await expect(resultPromise).resolves.toEqual({ ok: true, tripId: '123' });
    expect(socket.join).toHaveBeenCalledWith('trip:123');
    expect(socket.emit).toHaveBeenCalledWith('trip.joined', {
      ok: true,
      tripId: '123',
    });
  });
});
