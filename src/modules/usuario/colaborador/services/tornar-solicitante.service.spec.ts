import { TornarSolicitanteService } from './tornar-solicitante.service';
import { ColaboradorDeOutraFilialException } from '../exceptions/colaborador-de-outra-filial.exception';

describe('TornarSolicitanteService organizational scope', () => {
  it('rejects an employee from another company with the same branch code', async () => {
    const colaboradorRepository = {
      buscar: jest.fn().mockResolvedValue({
        id: 20,
        empresaId: 2,
        filialId: 10,
      }),
      atualizarCentroCusto: jest.fn(),
    };
    const centroCustoRepository = { buscar: jest.fn() };
    const service = new TornarSolicitanteService(
      colaboradorRepository as never,
      centroCustoRepository as never,
    );

    await expect(
      service.execute({
        colaboradorId: 20,
        empresaId: 1,
        filialId: 10,
        centroCustoId: 4,
      }),
    ).rejects.toBeInstanceOf(ColaboradorDeOutraFilialException);
    expect(centroCustoRepository.buscar).not.toHaveBeenCalled();
    expect(colaboradorRepository.atualizarCentroCusto).not.toHaveBeenCalled();
  });
});
