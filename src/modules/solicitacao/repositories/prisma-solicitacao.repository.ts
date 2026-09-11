import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DateTime } from 'luxon';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { PrismaService } from '@core/prisma/services/prisma.service';
import {
  FiltrosBuscarSolicitacoes,
  FiltrosBuscarSolicitacoesParaAprovacao,
  DecisaoFornecedor,
  RegraCorridaInput,
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
import { RespostaPergunta } from '../domain/resposta-pergunta-solicitacao';
import { Solicitacao } from '../domain/solicitacao';
import { TipoCorrida } from '../domain/tipo-corrida';
import { OrdenacaoSolicitacao } from '../enums/ordenacao-solicitacao.enum';
import { StatusCorrida } from '../enums/status-corrida.enum';
import { StatusSolicitacao } from '../enums/status-solicitacao.enum';
import { StatusAprovacao } from '../enums/status-aprovacao.enum';
import { SolicitacaoNaoCancelavelException } from '../exceptions/solicitacao-nao-cancelavel.exception';
import { SolicitacaoNaoEncontradaException } from '../exceptions/solicitacao-nao-encontrada.exception';
import { SolicitacaoHorarioDuplicadoException } from '../exceptions/solicitacao-horario-duplicado.exception';
import { SolicitacaoNaoPodeSerDecididaPeloFornecedorException } from '../exceptions/solicitacao-nao-pode-ser-decidida-pelo-fornecedor.exception';
import { MotoristaOuVeiculoIndisponivelException } from '../exceptions/motorista-ou-veiculo-indisponivel.exception';

@Injectable()
export class PrismaSolicitacaoRepository extends SolicitacaoRepositoryContract {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async existeConflitoDeHorario(
    solicitanteId: number,
    dataCorrida: DateTime,
  ): Promise<boolean> {
    const inicio = dataCorrida.startOf('minute').toJSDate();
    const fim = dataCorrida.startOf('minute').plus({ minutes: 1 }).toJSDate();

    const registro = await this.prismaService.solicitacao.findFirst({
      where: {
        nCdSolicitante: solicitanteId,
        cStatus: {
          in: [StatusSolicitacao.PENDENTE, StatusSolicitacao.APROVADA],
        },
        dCorrida: {
          gte: inicio,
          lt: fim,
        },
      },
      select: { nCdSolicitacao: true },
    });

    return registro != null;
  }

  async criar(solicitacao: Solicitacao): Promise<Solicitacao> {
    const id = await this.prismaService.$transaction(async (tx) => {
      const inicio = solicitacao.dataCorrida.startOf('minute').toJSDate();
      const fim = solicitacao.dataCorrida
        .startOf('minute')
        .plus({ minutes: 1 })
        .toJSDate();
      const conflito = await tx.solicitacao.findFirst({
        where: {
          nCdSolicitante: solicitacao.solicitanteId,
          cStatus: {
            in: [StatusSolicitacao.PENDENTE, StatusSolicitacao.APROVADA],
          },
          dCorrida: {
            gte: inicio,
            lt: fim,
          },
        },
        select: { nCdSolicitacao: true },
      });

      if (conflito) {
        throw new SolicitacaoHorarioDuplicadoException();
      }

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
          nCdContrato: solicitacao.contratoId,
          dCriacao: solicitacao.dataCriacao.toJSDate(),
          dCorrida: solicitacao.dataCorrida.toJSDate(),
          nDistanciaEstimada: solicitacao.distanciaEstimadaKm,
          nCdTipoCorrida: solicitacao.tipoCorrida.id,
          nCdTpVeiculo: solicitacao.tipoVeiculo?.id ?? null,
          nCdEnderecoOrigem: origemId,
          nCdEnderecoDestino: destinoId,
          nCdRotaFixa: solicitacao.rotaFixaId ?? null,
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

      if (solicitacao.respostasPerguntas.length > 0) {
        await tx.solicitacaoResposta.createMany({
          data: solicitacao.respostasPerguntas.map((resposta) => ({
            nCdSolicitacao: solicitacaoId,
            nCdContrato: solicitacao.contratoId,
            nCdPergunta: resposta.perguntaId,
            cResposta: resposta.resposta === RespostaPergunta.SIM ? 'S' : 'N',
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

  async buscarPendentesParaAprovacao(
    filtros: FiltrosBuscarSolicitacoesParaAprovacao,
  ): Promise<PaginatedResponseInterface<Solicitacao>> {
    const periodo: Prisma.DateTimeFilter = {};
    if (filtros.dataInicio) {
      periodo.gte = filtros.dataInicio.startOf('day').toJSDate();
    }
    if (filtros.dataFim) {
      periodo.lte = filtros.dataFim.endOf('day').toJSDate();
    }

    const where: Prisma.SolicitacaoWhereInput = {
      cStatus: StatusSolicitacao.PENDENTE,
      ...(filtros.tipoCorridaId != null
        ? { nCdTipoCorrida: filtros.tipoCorridaId }
        : {}),
      ...(Object.keys(periodo).length > 0 ? { dCorrida: periodo } : {}),
      SolicitacaoCentroCusto: {
        some: {
          nCdAprovador: filtros.aprovadorId,
          cStatusAprovacao: StatusAprovacao.PENDENTE,
        },
      },
    };
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
    const resultado = await this.prismaService.solicitacao.updateMany({
      where: {
        nCdSolicitacao: id,
        cStatus: {
          in: [StatusSolicitacao.PENDENTE, StatusSolicitacao.APROVADA],
        },
        Corrida: { none: {} },
      },
      data: {
        cStatus: StatusSolicitacao.CANCELADA,
        nCdMotivoCancelamento: motivoCancelamentoId,
      },
    });

    if (resultado.count === 0) {
      throw new SolicitacaoNaoCancelavelException(id);
    }

    const cancelada = await this.buscar(id);

    if (!cancelada) {
      throw new SolicitacaoNaoEncontradaException(id);
    }

    return cancelada;
  }

  async criarCorrida(
    id: number,
    fornecedorId: number,
    motoristaId: number,
    veiculoId: number,
    regras: RegraCorridaInput[],
  ): Promise<Solicitacao> {
    await this.prismaService.$transaction(
      async (tx) => {
        const solicitacao = await tx.solicitacao.findFirst({
          where: { nCdSolicitacao: id, nCdFornecedor: fornecedorId },
          include: { Corrida: true },
        });

        if (solicitacao == null) {
          throw new SolicitacaoNaoEncontradaException(id);
        }

        const existemCorridasNaoCanceladas = solicitacao.Corrida.some(
          (corrida) => corrida.cStatus !== StatusCorrida.CANCELADA,
        );

        if (
          solicitacao.cStatus !== StatusSolicitacao.APROVADA ||
          existemCorridasNaoCanceladas
        ) {
          throw new SolicitacaoNaoPodeSerDecididaPeloFornecedorException(id);
        }

        const motorista = await tx.usuario.findFirst({
          where: {
            nCdUsuario: motoristaId,
            nCdFornecedor: fornecedorId,
            cDisponivel: 'S',
            dAtivacao: { lte: solicitacao.dCorrida },
            dDesativacao: null,
          },
        });
        const veiculo = await tx.veiculo.findFirst({
          where: {
            nCdFornecedor: fornecedorId,
            nCdVeiculo: veiculoId,
            dAtivacao: { lte: solicitacao.dCorrida },
            dDesativacao: null,
            ...(solicitacao.nCdTpVeiculo == null
              ? {}
              : { nCdTpVeiculo: solicitacao.nCdTpVeiculo }),
          },
        });

        if (motorista == null || veiculo == null) {
          throw new MotoristaOuVeiculoIndisponivelException();
        }

        const inicio = new Date(solicitacao.dCorrida);
        inicio.setSeconds(0, 0);
        const fim = new Date(inicio);
        fim.setMinutes(fim.getMinutes() + 1);

        const recursoOcupado = await tx.corrida.findFirst({
          where: {
            cStatus: { not: StatusCorrida.CANCELADA },
            dInicioCorrida: { gte: inicio, lt: fim },
            OR: [
              { nCdMotorista: motoristaId },
              { nCdFornecedor: fornecedorId, nCdVeiculo: veiculoId },
            ],
          },
          select: { nCdCorrida: true },
        });

        if (recursoOcupado != null) {
          throw new MotoristaOuVeiculoIndisponivelException();
        }

        const solicitacaoReservada = await tx.solicitacao.updateMany({
          where: {
            nCdSolicitacao: id,
            nCdFornecedor: fornecedorId,
            cStatus: StatusSolicitacao.APROVADA,
            Corrida: { none: { cStatus: { not: StatusCorrida.CANCELADA } } },
          },
          data: { cMotivoRecusaFornecedor: null },
        });

        if (solicitacaoReservada.count === 0) {
          throw new SolicitacaoNaoPodeSerDecididaPeloFornecedorException(id);
        }

        const ultimaCorrida = await tx.corrida.aggregate({
          _max: { nCdCorrida: true },
        });
        const corridaId = (ultimaCorrida._max.nCdCorrida?.toNumber() ?? 0) + 1;

        await tx.corrida.create({
          data: {
            nCdCorrida: corridaId,
            nCdSolicitacao: id,
            nCdMotorista: motoristaId,
            nCdFornecedor: fornecedorId,
            nCdVeiculo: veiculoId,
            dInicioCorrida: solicitacao.dCorrida,
            nKmPercorrido: 0,
            nValorFinal: solicitacao.nValorEstimado,
            cStatus: StatusCorrida.AGENDADA,
          },
        });

        if (regras.length > 0) {
          await tx.regraCorrida.createMany({
            data: regras.map((regra) => ({
              nCdCorrida: corridaId,
              nCdContrato: regra.contratoId,
              nCdRegra: regra.regraId,
              nValorCobrado: regra.valorCobrado,
            })),
          });
        }
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    const atualizada = await this.buscar(id);
    if (!atualizada) {
      throw new SolicitacaoNaoEncontradaException(id);
    }
    return atualizada;
  }

  async decidirPeloFornecedor(
    id: number,
    fornecedorId: number,
    decisao: DecisaoFornecedor,
  ): Promise<Solicitacao> {
    if (decisao.decisao === 'REATRIBUIR') {
      if (decisao.motoristaId == null || decisao.veiculoId == null) {
        throw new MotoristaOuVeiculoIndisponivelException();
      }

      return this.criarCorrida(
        id,
        fornecedorId,
        decisao.motoristaId,
        decisao.veiculoId,
        [],
      );
    }

    await this.prismaService.$transaction(async (tx) => {
      const solicitacao = await tx.solicitacao.findFirst({
        where: { nCdSolicitacao: id, nCdFornecedor: fornecedorId },
        include: { Corrida: true },
      });

      if (solicitacao == null) {
        throw new SolicitacaoNaoEncontradaException(id);
      }

      const aguardandoDecisao =
        solicitacao.Corrida.length > 0 &&
        solicitacao.Corrida.every(
          (corrida) => corrida.cStatus === StatusCorrida.CANCELADA,
        );

      if (
        solicitacao.cStatus !== StatusSolicitacao.APROVADA ||
        !aguardandoDecisao
      ) {
        throw new SolicitacaoNaoPodeSerDecididaPeloFornecedorException(id);
      }

      const solicitacaoReservada = await tx.solicitacao.updateMany({
        where: {
          nCdSolicitacao: id,
          nCdFornecedor: fornecedorId,
          cStatus: StatusSolicitacao.APROVADA,
          Corrida: {
            some: { cStatus: StatusCorrida.CANCELADA },
            none: { cStatus: { not: StatusCorrida.CANCELADA } },
          },
        },
        data: { cMotivoRecusaFornecedor: null },
      });

      if (solicitacaoReservada.count === 0) {
        throw new SolicitacaoNaoPodeSerDecididaPeloFornecedorException(id);
      }

      await tx.solicitacao.update({
        where: { nCdSolicitacao: id },
        data: {
          cStatus: StatusSolicitacao.CANCELADA,
          cMotivoRecusaFornecedor: decisao.motivo?.trim(),
        },
      });
    });

    const atualizada = await this.buscar(id);
    if (!atualizada) {
      throw new SolicitacaoNaoEncontradaException(id);
    }
    return atualizada;
  }

  private montarWhere(
    filtros: FiltrosBuscarSolicitacoes,
  ): Prisma.SolicitacaoWhereInput {
    const periodo: Prisma.DateTimeFilter = {};
    const dataInicioInformada = filtros.dataInicio?.startOf('day');

    if (filtros.historico) {
      if (dataInicioInformada) {
        periodo.gte = dataInicioInformada.toJSDate();
      }
    } else if (!filtros.incluirAnteriores) {
      const inicioDaJanela = DateTime.now().minus({ days: 1 }).startOf('day');
      const dataInicio =
        dataInicioInformada &&
        dataInicioInformada.toMillis() > inicioDaJanela.toMillis()
          ? dataInicioInformada
          : inicioDaJanela;

      periodo.gte = dataInicio.toJSDate();
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
            AND: [
              { cStatus: { not: StatusSolicitacao.CANCELADA } },
              {
                Corrida: {
                  some: { cStatus: StatusCorrida.FINALIZADA },
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
