import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { StatusCorrida } from '@module/solicitacao/enums/status-corrida.enum';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { CorridaAcessoNegadoException } from '../exceptions/corrida-acesso-negado.exception';
import { CorridaNaoEncontradaException } from '../exceptions/corrida-nao-encontrada.exception';

export type CorridaStatus = 'A' | 'I' | 'F' | 'C';

const INCLUDE_CORRIDA = {
  Usuario: true,
  Veiculo: { include: { Fornecedor: true } },
  Solicitacao: { include: { Usuario: true } },
} satisfies Prisma.CorridaInclude;

export type PrismaCorridaCompleta = Prisma.CorridaGetPayload<{
  include: typeof INCLUDE_CORRIDA;
}>;

export interface FiltrosCorrida {
  status?: CorridaStatus;
  dataInicio?: Date;
  dataFim?: Date;
}

@Injectable()
export class PrismaCorridaRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async buscar(
    id: number,
    usuario: AuthenticatedUser,
  ): Promise<PrismaCorridaCompleta> {
    const corrida = await this.prismaService.corrida.findFirst({
      where: {
        nCdCorrida: id,
        ...this.escopo(usuario),
      },
      include: INCLUDE_CORRIDA,
    });

    if (corrida == null) {
      throw new CorridaNaoEncontradaException(id);
    }

    return corrida;
  }

  async listar(
    usuario: AuthenticatedUser,
    filtros: FiltrosCorrida,
  ): Promise<PrismaCorridaCompleta[]> {
    return this.prismaService.corrida.findMany({
      where: {
        ...this.escopo(usuario),
        ...(filtros.status ? { cStatus: filtros.status } : {}),
        ...(filtros.dataInicio || filtros.dataFim
          ? {
              Solicitacao: {
                dCorrida: {
                  ...(filtros.dataInicio ? { gte: filtros.dataInicio } : {}),
                  ...(filtros.dataFim ? { lte: filtros.dataFim } : {}),
                },
              },
            }
          : {}),
      },
      include: INCLUDE_CORRIDA,
      orderBy: { Solicitacao: { dCorrida: 'desc' } },
    });
  }

  private escopo(usuario: AuthenticatedUser): Prisma.CorridaWhereInput {
    const perfis = new Set(usuario.perfis);
    if (perfis.has(TipoPerfil.ADMIN_MASTER)) return {};

    const escopos: Prisma.CorridaWhereInput[] = [];
    if (
      perfis.has(TipoPerfil.SOLICITANTE) ||
      perfis.has(TipoPerfil.SOLICITANTE_EMERGENCIA)
    ) {
      escopos.push({ Solicitacao: { nCdSolicitante: usuario.id } });
    }
    if (perfis.has(TipoPerfil.MOTORISTA)) {
      escopos.push({ nCdMotorista: usuario.id });
    }
    if (perfis.has(TipoPerfil.ADMIN_FORNECEDOR)) {
      escopos.push({ nCdFornecedor: usuario.fornecedorId ?? -1 });
    }
    if (perfis.has(TipoPerfil.APROVADOR)) {
      escopos.push({
        Solicitacao: {
          SolicitacaoCentroCusto: { some: { nCdAprovador: usuario.id } },
        },
      });
    }
    if (perfis.has(TipoPerfil.ADMIN_FILIAL)) {
      const filialId = usuario.filialId ?? -1;
      escopos.push({
        OR: [
          { Solicitacao: { Usuario: { nCdFilial: filialId } } },
          {
            Solicitacao: {
              SolicitacaoCentroCusto: { some: { nCdFilial: filialId } },
            },
          },
        ],
      });
    }

    if (escopos.length === 0) {
      throw new CorridaAcessoNegadoException();
    }

    return { OR: escopos };
  }
}
