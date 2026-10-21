import { DirecaoOrdenacao } from '@common/enums/direcao-ordenacao.enum';
import { CampoOrdenacaoFilial } from '../enums/ordenacao-filial.enum';
import { PrismaFilialRepository } from './prisma-filial.repository';

describe('PrismaFilialRepository.buscarVarios', () => {
  const criarRepository = () => {
    const prismaService = {
      filial: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    };

    return {
      repository: new PrismaFilialRepository(prismaService as never),
      findMany: prismaService.filial.findMany,
    };
  };

  it('mantém a ordem por nome quando nada é pedido', async () => {
    const { repository, findMany } = criarRepository();

    await repository.buscarVarios({ page: 1, limit: 10 });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { cNmFilial: 'asc' } }),
    );
  });

  it('ordena pela cidade do endereço na direção pedida', async () => {
    const { repository, findMany } = criarRepository();

    await repository.buscarVarios({
      ordenarPor: CampoOrdenacaoFilial.CIDADE,
      direcao: DirecaoOrdenacao.DESC,
      page: 1,
      limit: 10,
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { Endereco: { cCidade: 'desc' } },
      }),
    );
  });
});
