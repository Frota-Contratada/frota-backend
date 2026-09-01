import { TrackingGateway } from './tracking.gateway';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';

describe('TrackingGateway', () => {
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
