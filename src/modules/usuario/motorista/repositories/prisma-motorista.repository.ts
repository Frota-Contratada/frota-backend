import { Injectable } from '@nestjs/common';
import {
  FiltrosMotorista,
  MotoristaRepositoryContract,
} from './motorista-repository.contract';
import { Motorista } from '../domain/motorista';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { PrismaMotoristaMapper } from './prisma-motorista.mapper';

@Injectable()
export class PrismaMotoristaRepository extends MotoristaRepositoryContract {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async buscar(id: number): Promise<Motorista | null> {
    return PrismaMotoristaMapper.toDomain(
      await this.prismaService.usuario.findFirst({
        where: {
          nCdUsuario: id,
          nCdFornecedor: { not: null },
        },
      }),
    );
  }

  async buscarVarios(filtros: FiltrosMotorista): Promise<Motorista[]> {
    const motoristas = await this.prismaService.usuario.findMany({
      where: {
        nCdFornecedor: { not: null },
        ...(filtros.nome
          ? { cNmUsuario: { contains: filtros.nome } }
          : {}),
        ...(filtros.cpf ? { cCPF: { contains: filtros.cpf } } : {}),
      },
      orderBy: { cNmUsuario: 'asc' },
    });

    return motoristas.flatMap((motorista) => {
      const motoristaDomain = PrismaMotoristaMapper.toDomain(motorista);
      return motoristaDomain ? [motoristaDomain] : [];
    });
  }

  async criar(motorista: Motorista): Promise<Motorista> {
    return this.prismaService.$transaction(async (tx) => {
      const ultimoUsuario = await tx.usuario.aggregate({
        _max: { nCdUsuario: true },
      });
      const proximoId = (ultimoUsuario._max.nCdUsuario?.toNumber() ?? 0) + 1;

      return PrismaMotoristaMapper.toDomain(
        await tx.usuario.create({
          data: {
            nCdUsuario: proximoId,
            cNmUsuario: motorista.nome,
            cEmail: motorista.email,
            cCPF: motorista.cpf,
            nCdFornecedor: motorista.fornecedorId,
            cDisponivel: 'S',
          },
        }),
      )!;
    });
  }
}
