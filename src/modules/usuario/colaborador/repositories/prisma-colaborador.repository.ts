import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { Colaborador } from '../domain/colaborador';
import { ColaboradorBigNumbers } from '../domain/types/colaborador-big-numbers.type';
import { ColaboradorSummary } from '../domain/types/colaborador-summary.type';
import { ColaboradorRepositoryContract } from './colaborador-repository.contract';
import {
  COLABORADOR_SELECT,
  PrismaColaboradorMapper,
} from './prisma-colaborador.mapper';

@Injectable()
export class PrismaColaboradorRepository extends ColaboradorRepositoryContract {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  private filtroDeColaborador(filialId?: number): Prisma.UsuarioWhereInput {
    if (filialId) {
      return { nCdFilial: filialId };
    }

    return {
      OR: [{ nCdFilial: { not: null } }, { nCdFornecedor: null }],
    };
  }

  private montarWhere(filtros: {
    nome?: string;
    cpf?: string;
    filialId?: number;
  }): Prisma.UsuarioWhereInput {
    return {
      ...this.filtroDeColaborador(filtros.filialId),
      dDesativacao: null,
      ...(filtros.nome ? { cNmUsuario: { contains: filtros.nome } } : {}),
      ...(filtros.cpf ? { cCPF: { contains: filtros.cpf } } : {}),
    };
  }

  async buscar(id: number): Promise<Colaborador | null> {
    const agora = new Date();

    return PrismaColaboradorMapper.toDomain(
      await this.prismaService.cliente.usuario.findFirst({
        where: {
          nCdUsuario: id,
          ...this.filtroDeColaborador(),
        },
        include: {
          UsuarioPerfil: {
            where: {
              dInicioVigencia: { lte: agora },
              OR: [{ dFimVigencia: null }, { dFimVigencia: { gt: agora } }],
            },
          },
        },
      }),
    );
  }

  async atualizarCentroCusto(id: number, centroCustoId: number): Promise<void> {
    await this.prismaService.cliente.usuario.update({
      where: { nCdUsuario: id },
      data: { nCdCentroCusto: centroCustoId },
    });
  }

  async concederPerfil(
    usuarioId: number,
    tipoPerfil: TipoPerfil,
  ): Promise<void> {
    const agora = new Date();

    await this.prismaService.cliente.usuarioPerfil.upsert({
      where: {
        nCdUsuario_cTipoPerfil: {
          nCdUsuario: usuarioId,
          cTipoPerfil: tipoPerfil,
        },
      },
      create: {
        nCdUsuario: usuarioId,
        cTipoPerfil: tipoPerfil,
        dInicioVigencia: agora,
      },
      update: {
        dInicioVigencia: agora,
        dFimVigencia: null,
      },
    });
  }

  async buscarVarios(filtros: {
    nome?: string;
    cpf?: string;
    filialId?: number;
    page: number;
    limit: number;
  }): Promise<PaginatedResponseInterface<ColaboradorSummary>> {
    const where = this.montarWhere(filtros);
    const skip = (filtros.page - 1) * filtros.limit;

    const [colaboradores, totalCount] = await Promise.all([
      this.prismaService.usuario.findMany({
        where,
        skip,
        take: filtros.limit,
        orderBy: { cNmUsuario: 'asc' },
        select: COLABORADOR_SELECT,
      }),
      this.prismaService.usuario.count({ where }),
    ]);

    const data = colaboradores.map((colaborador) =>
      PrismaColaboradorMapper.toSummary(colaborador),
    );

    return {
      data,
      totalCount,
      hasNextPage: filtros.page * filtros.limit < totalCount,
    };
  }

  async buscarBigNumbers(filtros: {
    nome?: string;
    cpf?: string;
    filialId?: number;
  }): Promise<ColaboradorBigNumbers> {
    const where = this.montarWhere(filtros);

    const [administradoresDeFilial, aprovadores, solicitantesDeEmergencia] =
      await Promise.all([
        this.contarPorPerfil(where, TipoPerfil.ADMIN_FILIAL),
        this.contarPorPerfil(where, TipoPerfil.APROVADOR),
        this.contarPorPerfil(where, TipoPerfil.SOLICITANTE_EMERGENCIA),
      ]);

    return {
      administradoresDeFilial,
      aprovadores,
      solicitantesDeEmergencia,
    };
  }

  private contarPorPerfil(
    where: Prisma.UsuarioWhereInput,
    perfil: TipoPerfil,
  ): Promise<number> {
    const agora = new Date();

    return this.prismaService.usuario.count({
      where: {
        AND: [
          where,
          {
            UsuarioPerfil: {
              some: {
                cTipoPerfil: perfil,
                dInicioVigencia: { lte: agora },
                OR: [{ dFimVigencia: null }, { dFimVigencia: { gt: agora } }],
              },
            },
          },
        ],
      },
    });
  }
}
