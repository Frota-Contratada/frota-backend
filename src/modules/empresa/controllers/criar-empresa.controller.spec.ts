import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CriarEmpresaController } from './criar-empresa.controller';

describe('CriarEmpresaController', () => {
  const empresa = {
    nCdEmpresa: new Prisma.Decimal(7),
    cNmEmpresa: 'Empresa de teste',
    dAtivacao: new Date('2026-01-01T00:00:00.000Z'),
    dDesativacao: null,
  };

  it('creates a company using its corporate code', async () => {
    const create = jest.fn().mockResolvedValue(empresa);
    const controller = new CriarEmpresaController({
      empresa: { create },
    } as never);

    const result = await controller.criar({
      empresaId: 7,
      nome: 'Empresa de teste',
      ativacao: '2026-01-01T00:00:00.000Z',
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        nCdEmpresa: 7,
        cNmEmpresa: 'Empresa de teste',
        dAtivacao: empresa.dAtivacao,
      },
    });
    expect(result.response.empresaId).toBe(7);
  });

  it('reports a duplicate corporate code as a conflict', async () => {
    const duplicate = new Prisma.PrismaClientKnownRequestError('duplicate', {
      code: 'P2002',
      clientVersion: '7.8.0',
    });
    const controller = new CriarEmpresaController({
      empresa: { create: jest.fn().mockRejectedValue(duplicate) },
    } as never);

    await expect(
      controller.criar({
        empresaId: 7,
        nome: 'Empresa de teste',
        ativacao: '2026-01-01T00:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
