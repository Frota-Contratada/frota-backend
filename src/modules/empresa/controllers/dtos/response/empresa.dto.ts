import { Prisma } from '@prisma/client';

export interface EmpresaDto {
  empresaId: number;
  nome: string;
  ativacao: Date;
  desativacao: Date | null;
}

export function paraEmpresaDto(empresa: {
  nCdEmpresa: Prisma.Decimal;
  cNmEmpresa: string;
  dAtivacao: Date;
  dDesativacao: Date | null;
}): EmpresaDto {
  return {
    empresaId: empresa.nCdEmpresa.toNumber(),
    nome: empresa.cNmEmpresa,
    ativacao: empresa.dAtivacao,
    desativacao: empresa.dDesativacao,
  };
}
