import { Prisma } from '@prisma/client';
import { DateTime } from 'luxon';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { Motorista } from '../domain/motorista';
import { PrismaMotoristaRepository } from './prisma-motorista.repository';

const decimal = (valor: number) => new Prisma.Decimal(valor);

describe('PrismaMotoristaRepository', () => {
  it('cria o motorista com telefone e perfil de motorista', async () => {
    const tx = {
      usuario: {
        aggregate: jest
          .fn()
          .mockResolvedValue({ _max: { nCdUsuario: decimal(9007) } }),
        create: jest.fn().mockResolvedValue({
          nCdUsuario: decimal(9008),
          cNmUsuario: 'Motorista Novo',
          cEmail: 'novo@frota.com.br',
          cCPF: '12345678901',
          cTelefone: '43999990000',
          nCdFornecedor: decimal(864),
          dAtivacao: new Date('2026-10-21T12:00:00.000Z'),
          dDesativacao: null,
        }),
      },
      usuarioPerfil: { create: jest.fn().mockResolvedValue({}) },
    };
    const prismaService = {
      $transaction: jest.fn((operacao: (cliente: typeof tx) => unknown) =>
        operacao(tx),
      ),
    };
    const repository = new PrismaMotoristaRepository(prismaService as never);

    const motorista = await repository.criar(
      new Motorista(
        'Motorista Novo',
        'novo@frota.com.br',
        DateTime.now(),
        0,
        864,
        '12345678901',
        undefined,
        '43999990000',
      ),
    );

    expect(tx.usuario.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        nCdUsuario: 9008,
        cTelefone: '43999990000',
        nCdFornecedor: 864,
      }) as object,
    });
    expect(tx.usuarioPerfil.create).toHaveBeenCalledWith({
      data: {
        nCdUsuario: 9008,
        cTipoPerfil: TipoPerfil.MOTORISTA,
        dInicioVigencia: expect.any(Date) as Date,
      },
    });
    expect(motorista.telefone).toBe('43999990000');
  });
});
