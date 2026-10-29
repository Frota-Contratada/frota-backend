import { Prisma } from '@prisma/client';
import { PrismaCentroCustoRepository } from './prisma-centro-custo.repository';

describe('PrismaCentroCustoRepository: aprovador dentro da transação', () => {
  // `cliente` devolve a transação em curso; `usuario` direto ficaria fora dela
  // e não veria o aprovador recém-concedido no cadastro do colaborador.
  const montar = (aprovadorId: number | null) => {
    const findFirst = jest
      .fn()
      .mockResolvedValue(
        aprovadorId === null
          ? null
          : { nCdUsuario: new Prisma.Decimal(aprovadorId) },
      );
    const findMany = jest
      .fn()
      .mockResolvedValue([{ nCdCentroCusto: new Prisma.Decimal(4704) }]);
    const repository = new PrismaCentroCustoRepository({
      cliente: { usuario: { findFirst, findMany } },
    } as never);
    return { repository, findFirst, findMany };
  };

  it('acha o aprovador do centro de custo pelo cliente da transação', async () => {
    const { repository, findFirst } = montar(9200);

    await expect(
      repository.existeAprovadorNoCentroCusto(30, 704, 4704),
    ).resolves.toBe(true);
    const [consulta] = findFirst.mock.calls[0] as [
      { where: { nCdCentroCusto: number } },
    ];
    expect(consulta.where.nCdCentroCusto).toBe(4704);
  });

  it('lista os centros de custo com aprovador pelo cliente da transação', async () => {
    const { repository, findMany } = montar(null);

    await expect(repository.buscarIdsComAprovador(30, 704)).resolves.toEqual([
      4704,
    ]);
    expect(findMany).toHaveBeenCalled();
  });
});
