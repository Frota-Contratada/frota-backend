import { Prisma } from '@prisma/client';
import { PrismaColaboradorRepository } from './prisma-colaborador.repository';

describe('PrismaColaboradorRepository.criar', () => {
  it('grava o colaborador no próximo ID, sem senha e disponível', async () => {
    const create = jest.fn().mockResolvedValue({});
    const repository = new PrismaColaboradorRepository({
      cliente: {
        usuario: {
          aggregate: jest.fn().mockResolvedValue({
            _max: { nCdUsuario: new Prisma.Decimal(41) },
          }),
          create,
        },
      },
    } as never);

    const id = await repository.criar({
      nome: 'Visitante',
      email: 'visitante@exemplo.com',
      empresaId: 30,
      filialId: 704,
    });

    expect(id).toBe(42);
    expect(create).toHaveBeenCalledWith({
      data: {
        nCdUsuario: 42,
        cNmUsuario: 'Visitante',
        cEmail: 'visitante@exemplo.com',
        cCPF: null,
        cCargo: null,
        nCdEmpresa: 30,
        nCdFilial: 704,
        cDisponivel: 'S',
      },
    });
  });
});
