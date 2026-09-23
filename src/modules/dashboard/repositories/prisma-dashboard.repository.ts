import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { StatusCorrida } from '@module/solicitacao/enums/status-corrida.enum';
import {
  CorridaDashboardRegistro,
  CorridaGastoRegistro,
  DashboardRepositoryContract,
  FiltrosDashboardCorridas,
} from './dashboard-repository.contract';

const SELECT_CORRIDA_DASHBOARD = {
  nCdCorrida: true,
  nCdFornecedor: true,
  dInicioCorrida: true,
  nKmPercorrido: true,
  nValorFinal: true,
  cStatus: true,
  Veiculo: {
    select: {
      Fornecedor: {
        select: { cNmFornecedor: true },
      },
    },
  },
  Solicitacao: {
    select: {
      dCorrida: true,
      nCdTipoCorrida: true,
      nDistanciaEstimada: true,
      nValorEstimado: true,
      Usuario: {
        select: {
          cNmUsuario: true,
          cEmail: true,
        },
      },
      Endereco_Solicitacao_nCdEnderecoDestinoToEndereco: {
        select: {
          cEndereco: true,
          cNumero: true,
          cBairro: true,
          cCidade: true,
          cUf: true,
        },
      },
    },
  },
} satisfies Prisma.CorridaSelect;

type CorridaDashboardCompleta = Prisma.CorridaGetPayload<{
  select: typeof SELECT_CORRIDA_DASHBOARD;
}>;

const SELECT_RATEIO_GASTO = {
  nCdFilial: true,
  nCdCentroCusto: true,
  CentroCusto: { select: { cNmCentroCusto: true } },
  Usuario: { select: { cNmUsuario: true } },
} satisfies Prisma.SolicitacaoCentroCustoSelect;

type RateioGastoCompleto = Prisma.SolicitacaoCentroCustoGetPayload<{
  select: typeof SELECT_RATEIO_GASTO;
}>;

@Injectable()
export class PrismaDashboardRepository extends DashboardRepositoryContract {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async buscarCorridas(
    filtros: FiltrosDashboardCorridas,
  ): Promise<CorridaDashboardRegistro[]> {
    const where = this.montarWhere(filtros);
    const corridas = await this.prismaService.corrida.findMany({
      where,
      select: SELECT_CORRIDA_DASHBOARD,
      orderBy: { dInicioCorrida: 'desc' },
    });

    return corridas.map((corrida) => this.paraRegistro(corrida));
  }

  async buscarGastos(
    filtros: FiltrosDashboardCorridas,
  ): Promise<CorridaGastoRegistro[]> {
    const corridas = await this.prismaService.corrida.findMany({
      where: this.montarWhere(filtros),
      select: {
        nCdCorrida: true,
        nCdFornecedor: true,
        dInicioCorrida: true,
        nValorFinal: true,
        Veiculo: {
          select: { Fornecedor: { select: { cNmFornecedor: true } } },
        },
        Solicitacao: {
          select: {
            dCorrida: true,
            _count: { select: { SolicitacaoCentroCusto: true } },
            SolicitacaoCentroCusto: {
              where: this.montarWhereRateio(filtros),
              select: SELECT_RATEIO_GASTO,
            },
          },
        },
      },
      orderBy: { dInicioCorrida: 'asc' },
    });

    return corridas.map((corrida) => ({
      id: corrida.nCdCorrida.toNumber(),
      data: corrida.dInicioCorrida ?? corrida.Solicitacao.dCorrida,
      fornecedorId: corrida.nCdFornecedor.toNumber(),
      fornecedorNome: corrida.Veiculo.Fornecedor.cNmFornecedor,
      preco: corrida.nValorFinal.toNumber(),
      totalRateios: corrida.Solicitacao._count.SolicitacaoCentroCusto,
      rateios: corrida.Solicitacao.SolicitacaoCentroCusto.map((rateio) =>
        this.paraRateio(rateio),
      ),
    }));
  }

  private paraRateio(rateio: RateioGastoCompleto) {
    return {
      filialId: rateio.nCdFilial.toNumber(),
      centroCustoId: rateio.nCdCentroCusto.toNumber(),
      centroCustoNome: rateio.CentroCusto.cNmCentroCusto,
      responsavelNome: rateio.Usuario.cNmUsuario,
    };
  }

  private montarWhereRateio(
    filtros: FiltrosDashboardCorridas,
  ): Prisma.SolicitacaoCentroCustoWhereInput {
    return {
      ...(filtros.filialId !== undefined
        ? { nCdFilial: filtros.filialId }
        : {}),
      ...(filtros.centroCustoId !== undefined
        ? { nCdCentroCusto: filtros.centroCustoId }
        : {}),
      ...(filtros.aprovadorId !== undefined
        ? { nCdAprovador: filtros.aprovadorId }
        : {}),
    };
  }

  private montarWhere(
    filtros: FiltrosDashboardCorridas,
  ): Prisma.CorridaWhereInput {
    const rateio = this.montarWhereRateio(filtros);
    const possuiFiltroOrganizacional = Object.keys(rateio).length > 0;

    return {
      dInicioCorrida: {
        gte: filtros.inicio,
        lte: filtros.fim,
      },
      ...(filtros.somenteFinalizadas
        ? { cStatus: StatusCorrida.FINALIZADA }
        : filtros.desconsiderarCanceladas
          ? { cStatus: { not: StatusCorrida.CANCELADA } }
          : {}),
      ...(possuiFiltroOrganizacional
        ? {
            Solicitacao: {
              SolicitacaoCentroCusto: {
                some: rateio,
              },
            },
          }
        : {}),
    };
  }

  private paraRegistro(
    corrida: CorridaDashboardCompleta,
  ): CorridaDashboardRegistro {
    const endereco =
      corrida.Solicitacao.Endereco_Solicitacao_nCdEnderecoDestinoToEndereco;

    return {
      id: corrida.nCdCorrida.toNumber(),
      data: corrida.dInicioCorrida ?? corrida.Solicitacao.dCorrida,
      status: corrida.cStatus.trim(),
      tipoCorridaId: corrida.Solicitacao.nCdTipoCorrida.toNumber(),
      fornecedorId: corrida.nCdFornecedor.toNumber(),
      fornecedorNome: corrida.Veiculo.Fornecedor.cNmFornecedor,
      solicitanteNome: corrida.Solicitacao.Usuario.cNmUsuario,
      solicitanteEmail: corrida.Solicitacao.Usuario.cEmail,
      destino: this.montarDestino(endereco),
      distanciaEstimada: corrida.Solicitacao.nDistanciaEstimada.toNumber(),
      distanciaPercorrida: corrida.nKmPercorrido.toNumber(),
      valorEstimado: corrida.Solicitacao.nValorEstimado.toNumber(),
      preco: corrida.nValorFinal.toNumber(),
    };
  }

  private montarDestino(endereco: {
    cEndereco: string;
    cNumero: string;
    cBairro: string;
    cCidade: string;
    cUf: string;
  }): string {
    const logradouro = [endereco.cEndereco, endereco.cNumero]
      .filter(Boolean)
      .join(', ');
    const localidade = [endereco.cBairro, `${endereco.cCidade}/${endereco.cUf}`]
      .filter(Boolean)
      .join(', ');

    return [logradouro, localidade].filter(Boolean).join(' - ');
  }
}
