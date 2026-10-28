import { DirecaoOrdenacao } from '@common/enums/direcao-ordenacao.enum';
import { CampoOrdenacaoMotorista } from '../enums/ordenacao-motorista.enum';
import { PrismaMotoristaRepository } from './prisma-motorista.repository';

describe('PrismaMotoristaRepository.buscarVarios', () => {
  it('ordena pela data de cadastro na direção pedida', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const repository = new PrismaMotoristaRepository({
      usuario: { findMany, count: jest.fn().mockResolvedValue(0) },
    } as never);

    await repository.buscarVarios({
      ordenarPor: CampoOrdenacaoMotorista.DATA_ATIVACAO,
      direcao: DirecaoOrdenacao.DESC,
      page: 2,
      limit: 5,
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { dAtivacao: 'desc' },
        skip: 5,
        take: 5,
      }),
    );
  });

  it('filtra pelo fornecedor quando informado', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(0);
    const repository = new PrismaMotoristaRepository({
      usuario: { findMany, count },
    } as never);

    await repository.buscarVarios({ fornecedorId: 864, page: 1, limit: 10 });
    await repository.buscarVarios({ page: 1, limit: 10 });

    expect(count).toHaveBeenNthCalledWith(1, {
      where: { nCdFornecedor: 864 },
    });
    expect(count).toHaveBeenNthCalledWith(2, {
      where: { nCdFornecedor: { not: null } },
    });
  });
});
