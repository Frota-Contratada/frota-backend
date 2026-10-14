import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BuscarEmpresaController } from './buscar-empresa.controller';

describe('BuscarEmpresaController', () => {
  const empresa = {
    nCdEmpresa: new Prisma.Decimal(7),
    cNmEmpresa: 'Empresa de teste',
    dAtivacao: new Date('2026-01-01T00:00:00.000Z'),
    dDesativacao: null,
  };

  it('reads a company by its full corporate code', async () => {
    const findUnique = jest.fn().mockResolvedValue(empresa);
    const controller = new BuscarEmpresaController({
      empresa: { findUnique },
    } as never);

    expect((await controller.buscar(7)).response.nome).toBe('Empresa de teste');
    expect(findUnique).toHaveBeenCalledWith({ where: { nCdEmpresa: 7 } });
  });

  it('does not report a missing company as an empty result', async () => {
    const controller = new BuscarEmpresaController({
      empresa: { findUnique: jest.fn().mockResolvedValue(null) },
    } as never);

    await expect(controller.buscar(7)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
