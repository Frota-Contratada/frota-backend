import { BuscarBeneficiariosService } from './buscar-beneficiarios.service';

describe('BuscarBeneficiariosService', () => {
  it('lists only the requester branch, without CPF filter', async () => {
    const resultado = {
      totalCount: 1,
      hasNextPage: false,
      data: [{ id: 7, nome: 'Maria Souza', email: 'maria@exemplo.com' }],
    };
    const colaboradorRepository = {
      buscarVarios: jest.fn().mockResolvedValue(resultado),
    };
    const service = new BuscarBeneficiariosService(
      colaboradorRepository as never,
    );

    await expect(
      service.execute({
        nome: 'mar',
        empresaId: 1,
        filialId: 10,
        page: 1,
        limit: 100,
      }),
    ).resolves.toBe(resultado);
    expect(colaboradorRepository.buscarVarios).toHaveBeenCalledWith({
      nome: 'mar',
      empresaId: 1,
      filialId: 10,
      page: 1,
      limit: 100,
    });
  });
});
