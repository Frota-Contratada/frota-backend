import { IniciarCorridaService } from './iniciar-corrida.service';

describe('IniciarCorridaService', () => {
  it('persiste a rota antes de alterar o status da corrida', async () => {
    const tracking = {
      assegurarRotaInicial: jest.fn().mockResolvedValue({ version: 1 }),
      publishStarted: jest.fn(),
    };
    const corrida = { id: 1 };
    const repository = { iniciar: jest.fn().mockResolvedValue(corrida) };
    const service = new IniciarCorridaService(
      repository as never,
      tracking as never,
    );

    await expect(service.execute(1, 10)).resolves.toBe(corrida);
    expect(
      tracking.assegurarRotaInicial.mock.invocationCallOrder[0],
    ).toBeLessThan(repository.iniciar.mock.invocationCallOrder[0]);
    expect(repository.iniciar.mock.invocationCallOrder[0]).toBeLessThan(
      tracking.publishStarted.mock.invocationCallOrder[0],
    );
  });

  it('não inicia a corrida quando o TomTom falha', async () => {
    const failure = new Error('TomTom indisponível');
    const tracking = {
      assegurarRotaInicial: jest.fn().mockRejectedValue(failure),
      publishStarted: jest.fn(),
    };
    const repository = { iniciar: jest.fn() };
    const service = new IniciarCorridaService(
      repository as never,
      tracking as never,
    );

    await expect(service.execute(1, 10)).rejects.toBe(failure);
    expect(repository.iniciar).not.toHaveBeenCalled();
    expect(tracking.publishStarted).not.toHaveBeenCalled();
  });
});
