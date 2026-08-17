import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DateTime } from 'luxon';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { PrismaService } from '@core/prisma/services/prisma.service';
import {
  FiltrosBuscarSolicitacoes,
  SolicitacaoRepositoryContract,
} from './solicitacao-repository.contract';
import {
  ContextoSolicitacao,
  INCLUDE_SOLICITACAO,
  NUMERO_NAO_INFORMADO,
  PrismaSolicitacaoCompleta,
  PrismaSolicitacaoMapper,
} from './prisma-solicitacao.mapper';
import { Endereco } from '../domain/endereco';
import { Solicitacao } from '../domain/solicitacao';
import { TipoCorrida } from '../domain/tipo-corrida';
import { OrdenacaoSolicitacao } from '../enums/ordenacao-solicitacao.enum';
import { StatusCorrida } from '../enums/status-corrida.enum';
import { StatusSolicitacao } from '../enums/status-solicitacao.enum';
import { SolicitacaoNaoEncontradaException } from '../exceptions/solicitacao-nao-encontrada.exception';

@Injectable()
export class PrismaSolicitacaoRepository extends SolicitacaoRepositoryContract {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async criar(solicitacao: Solicitacao): Promise<Solicitacao> {
    const id = await this.prismaService.$transaction(async (tx) => {
      const ultimoEndereco = await tx.endereco.aggregate({
        _max: { nCdEndereco: true },
      });
      let proximoEnderecoId =
        (ultimoEndereco._max.nCdEndereco?.toNumber() ?? 0) + 1;

      const criarEndereco = async (endereco: Endereco): Promise<number> => {
        const enderecoId = proximoEnderecoId;
        proximoEnderecoId += 1;

        await tx.endereco.create({
          data: {
            nCdEndereco: enderecoId,
            cEndereco: endereco.logradouro,
            cNumero: endereco.numero ?? NUMERO_NAO_INFORMADO,
            cComplemento: endereco.complemento ?? null,
            cBairro: endereco.bairro ?? '',
            cCidade: endereco.cidade,
            cUf: endereco.uf,
            cCEP: endereco.cep ?? '',
            nLatitude: endereco.latitude,
            nLongitude: endereco.longitude,
          },
        });

        return enderecoId;
      };

      const origemId = await criarEndereco(solicitacao.origem);
      const destinoId = await criarEndereco(solicitacao.destino);

      const paradasComEndereco: {
        ordem: number;
        enderecoId: number;
        tempo?: number;
      }[] = [];

      for (const parada of solicitacao.paradas) {
        paradasComEndereco.push({
          ordem: parada.ordem,
          enderecoId: await criarEndereco(parada.endereco),
          tempo: parada.tempoParadaMinutos,
        });
      }

      const ultimaSolicitacao = await tx.solicitacao.aggregate({
        _max: { nCdSolicitacao: true },
      });
      const solicitacaoId =
        (ultimaSolicitacao._max.nCdSolicitacao?.toNumber() ?? 0) + 1;

      await tx.solicitacao.create({
        data: {
          nCdSolicitacao: solicitacaoId,
          nCdSolicitante: solicitacao.solicitanteId,
          nCdFornecedor: solicitacao.fornecedorId,
          dCriacao: solicitacao.dataCriacao.toJSDate(),
          dCorrida: solicitacao.dataCorrida.toJSDate(),
          nDistanciaEstimada: solicitacao.distanciaEstimadaKm,
          nCdTipoCorrida: solicitacao.tipoCorrida.id,
          nCdTpVeiculo: solicitacao.tipoVeiculo?.id ?? null,
          nCdEnderecoOrigem: origemId,
          nCdEnderecoDestino: destinoId,
          nValorEstimado: solicitacao.valorEstimado,
          cStatus: solicitacao.status,
          nCdMotivoSolicitacao: solicitacao.motivoSolicitacao.id,
        },
      });

      if (paradasComEndereco.length > 0) {
        await tx.parada.createMany({
          data: paradasComEndereco.map((parada) => ({
            nCdSolicitacao: solicitacaoId,
            iOrdem: parada.ordem,
            nCdEndereco: parada.enderecoId,
            iTempoParadaMinutos: parada.tempo ?? null,
          })),
        });
      }

      if (solicitacao.centrosCusto.length > 0) {
        await tx.solicitacaoCentroCusto.createMany({
          data: solicitacao.centrosCusto.map((rateio) => ({
            nCdSolicitacao: solicitacaoId,
            nCdFilial: rateio.filialId,
            nCdCentroCusto: rateio.centroCustoId,
            nCdAprovador: rateio.aprovadorId,
            cStatusAprovacao: rateio.statusAprovacao,
          })),
        });
      }

      if (solicitacao.passageiros.length > 0) {
        await tx.solicitacaoPassageiro.createMany({
          data: solicitacao.passageiros.map((passageiro) => ({
            nCdSolicitacao: solicitacaoId,
            cCPF: passageiro.cpf,
          })),
        });
      }

      return solicitacaoId;
    });

    const criada = await this.buscar(id);

    if (!criada) {
      throw new SolicitacaoNaoEncontradaException(id);
    }

    return criada;
  }

  async buscar(id: number): Promise<Solicitacao | null> {
    const registro = await this.prismaService.solicitacao.findUnique({
      where: { nCdSolicitacao: id },
      include: INCLUDE_SOLICITACAO,
    });

    if (registro == null) return null;

    const contexto = await this.montarContexto([registro]);

    return PrismaSolicitacaoMapper.toDomain(registro, contexto);
  }

  async buscarVarias(
    filtros: FiltrosBuscarSolicitacoes,
  ): Promise<PaginatedResponseInterface<Solicitacao>> {
    const where = this.montarWhere(filtros);
    const skip = (filtros.page - 1) * filtros.limit;

    const [registros, totalCount] = await Promise.all([
      this.prismaService.solicitacao.findMany({
        where,
        skip,
        take: filtros.limit,
        include: INCLUDE_SOLICITACAO,
        orderBy: {
          dCorrida:
            filtros.ordenacao === OrdenacaoSolicitacao.ANTIGA ? 'asc' : 'desc',
        },
      }),
      this.prismaService.solicitacao.count({ where }),
    ]);

    const contexto = await this.montarContexto(registros);

    return {
      data: registros.map((registro) =>
        PrismaSolicitacaoMapper.toDomain(registro, contexto),
      ),
      totalCount,
      hasNextPage: filtros.page * filtros.limit < totalCount,
    };
  }

  async buscarAgendadasPorPeriodo(filtros: {
    solicitanteId: number;
    inicio: DateTime;
    fim: DateTime;
  }): Promise<Solicitacao[]> {
    const registros = await this.prismaService.solicitacao.findMany({
      where: {
        nCdSolicitante: filtros.solicitanteId,
        cStatus: StatusSolicitacao.APROVADA,
        dCorrida: {
          gte: filtros.inicio.startOf('day').toJSDate(),
          lte: filtros.fim.endOf('day').toJSDate(),
        },
      },
      include: INCLUDE_SOLICITACAO,
      orderBy: { dCorrida: 'asc' },
    });

    const contexto = await this.montarContexto(registros);

    return registros.map((registro) =>
      PrismaSolicitacaoMapper.toDomain(registro, contexto),
    );
  }

  async cancelar(
    id: number,
    motivoCancelamentoId: number,
  ): Promise<Solicitacao> {
    await this.prismaService.solicitacao.update({
      where: { nCdSolicitacao: id },
      data: {
        cStatus: StatusSolicitacao.CANCELADA,
        nCdMotivoCancelamento: motivoCancelamentoId,
      },
    });

    const cancelada = await this.buscar(id);

    if (!cancelada) {
      throw new SolicitacaoNaoEncontradaException(id);
    }

    return cancelada;
  }

  private montarWhere(
    filtros: FiltrosBuscarSolicitacoes,
  ): Prisma.SolicitacaoWhereInput {
    const periodo: Prisma.DateTimeFilter = {};

    if (filtros.dataInicio) {
      periodo.gte = filtros.dataInicio.startOf('day').toJSDate();
    }

    if (filtros.dataFim) {
      periodo.lte = filtros.dataFim.endOf('day').toJSDate();
    }

    return {
      nCdSolicitante: filtros.solicitanteId,
      ...(filtros.status ? { cStatus: filtros.status } : {}),
      ...(filtros.tipoCorridaId != null
        ? { nCdTipoCorrida: filtros.tipoCorridaId }
        : {}),
      ...(Object.keys(periodo).length > 0 ? { dCorrida: periodo } : {}),
      ...(filtros.historico
        ? {
            OR: [
              { cStatus: StatusSolicitacao.CANCELADA },
              {
                Corrida: {
                  some: {
                    cStatus: {
                      in: [StatusCorrida.FINALIZADA, StatusCorrida.CANCELADA],
                    },
                  },
                },
              },
            ],
          }
        : {}),
    };
  }

  private async montarContexto(
    registros: PrismaSolicitacaoCompleta[],
  ): Promise<ContextoSolicitacao> {
    if (registros.length === 0) {
      return { tiposCorrida: new Map(), nomesPorCpf: new Map() };
    }

    const tipoCorridaIds = [
      ...new Set(
        registros.map((registro) => registro.nCdTipoCorrida.toNumber()),
      ),
    ];
    const cpfs = [
      ...new Set(
        registros.flatMap((registro) =>
          registro.SolicitacaoPassageiro.map((passageiro) => passageiro.cCPF),
        ),
      ),
    ];

    const [tipos, usuarios] = await Promise.all([
      this.prismaService.tipoCorrida.findMany({
        where: { nCdTipoCorrida: { in: tipoCorridaIds } },
      }),
      cpfs.length > 0
        ? this.prismaService.usuario.findMany({
            where: { cCPF: { in: cpfs } },
            select: { cCPF: true, cNmUsuario: true },
          })
        : Promise.resolve<{ cCPF: string | null; cNmUsuario: string }[]>([]),
    ]);

    return {
      tiposCorrida: new Map(
        tipos.map((tipo) => [
          tipo.nCdTipoCorrida.toNumber(),
          new TipoCorrida(tipo.nCdTipoCorrida.toNumber(), tipo.cNmTipoCorrida),
        ]),
      ),
      nomesPorCpf: new Map(
        usuarios.flatMap((usuario): [string, string][] =>
          usuario.cCPF == null ? [] : [[usuario.cCPF, usuario.cNmUsuario]],
        ),
      ),
    };
  }
}
