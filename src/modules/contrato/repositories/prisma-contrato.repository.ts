import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DateTime } from 'luxon';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { Contrato } from '../domain/contrato';
import { Regra } from '../domain/regra';
import { ContratoBigNumbers } from '../domain/types/contrato-big-numbers.type';
import { ContratoSummary } from '../domain/types/contrato-summary.type';
import { SituacaoContrato } from '../enums/situacao-contrato.enum';
import { DIAS_PARA_VENCER_EM_BREVE } from '../enums/status-contrato.enum';
import { TIPO_REGRA_ID } from '../enums/tipo-regra.enum';
import { ContratoNaoEditavelException } from '../exceptions/contrato-nao-editavel.exception';
import { ContratoNaoEncontradoException } from '../exceptions/contrato-nao-encontrado.exception';
import { ContratoRepositoryContract } from './contrato-repository.contract';
import {
  CONTRATO_VINCULO_SELECT,
  PrismaContratoMapper,
} from './prisma-contrato.mapper';

@Injectable()
export class PrismaContratoRepository extends ContratoRepositoryContract {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  private filtroDeVinculo(filtros: {
    filialId?: number;
    fornecedorId?: number;
  }): Prisma.FilialFornecedorWhereInput | undefined {
    if (!filtros.filialId && !filtros.fornecedorId) {
      return undefined;
    }

    return {
      ...(filtros.filialId ? { nCdFilial: filtros.filialId } : {}),
      ...(filtros.fornecedorId
        ? { nCdFornecedor: filtros.fornecedorId }
        : {}),
    };
  }

  private montarWhere(filtros: {
    filialId?: number;
    fornecedorId?: number;
    vigenciaDe?: Date;
    vigenciaAte?: Date;
  }): Prisma.ContratoWhereInput {
    const vinculo = this.filtroDeVinculo(filtros);

    const vigenciaDe = filtros.vigenciaDe
      ? DateTime.fromJSDate(filtros.vigenciaDe).startOf('day').toJSDate()
      : undefined;
    const vigenciaAte = filtros.vigenciaAte
      ? DateTime.fromJSDate(filtros.vigenciaAte).startOf('day').toJSDate()
      : undefined;

    return {
      ...(vinculo ? { FilialFornecedor: { some: vinculo } } : {}),
      ...(vigenciaAte ? { dVigenciaInicio: { lte: vigenciaAte } } : {}),
      ...(vigenciaDe
        ? {
            OR: [{ dVigenciaFim: null }, { dVigenciaFim: { gte: vigenciaDe } }],
          }
        : {}),
    };
  }

  async criar(contrato: Contrato): Promise<Contrato> {
    return this.prismaService.$transaction(async (tx) => {
      const ultimoContrato = await tx.contrato.aggregate({
        _max: { nCdContrato: true },
      });
      const proximoId = (ultimoContrato._max.nCdContrato?.toNumber() ?? 0) + 1;

      const registro = await tx.contrato.create({
        data: {
          nCdContrato: proximoId,
          cCaminhoArquivo: contrato.caminhoArquivo,
          nCdUsuarioCadastro: contrato.usuarioCadastroId,
          dVigenciaInicio: contrato.dataVigenciaInicio.toJSDate(),
          dVigenciaFim: contrato.dataVigenciaFim?.toJSDate() ?? null,
        },
      });

      return PrismaContratoMapper.toDomain(registro);
    });
  }

  async buscar(id: number): Promise<Contrato | null> {
    return PrismaContratoMapper.toDomain(
      await this.prismaService.contrato.findUnique({
        where: { nCdContrato: id },
      }),
    );
  }

  async substituirRegras(contratoId: number, regras: Regra[]): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
      const contrato = await tx.contrato.findUnique({
        where: { nCdContrato: contratoId },
        select: { cSituacao: true },
      });

      if (!contrato) {
        throw new ContratoNaoEncontradoException(contratoId);
      }

      if (contrato.cSituacao !== SituacaoContrato.RASCUNHO) {
        throw new ContratoNaoEditavelException(contratoId);
      }

      const condicoesAnteriores = await tx.condicaoRegra.findMany({
        where: { nCdContrato: contratoId },
        select: {
          CondicaoRegraRotaFixa: {
            select: {
              nCdRota: true,
              RotaFixa: {
                select: {
                  nCdEnderecoOrigem: true,
                  nCdEnderecoDestino: true,
                },
              },
            },
          },
          CondicaoRegraOutro: { select: { nCdPergunta: true } },
        },
      });

      const rotasAnteriores = condicoesAnteriores.flatMap((condicao) =>
        condicao.CondicaoRegraRotaFixa.map((vinculo) => vinculo.RotaFixa),
      );
      const rotaIds = [
        ...new Set(
          condicoesAnteriores.flatMap((condicao) =>
            condicao.CondicaoRegraRotaFixa.map((vinculo) =>
              vinculo.nCdRota.toNumber(),
            ),
          ),
        ),
      ];
      const enderecoIds = [
        ...new Set(
          rotasAnteriores.flatMap((rota) => [
            rota.nCdEnderecoOrigem.toNumber(),
            rota.nCdEnderecoDestino.toNumber(),
          ]),
        ),
      ];
      const perguntaIds = [
        ...new Set(
          condicoesAnteriores
            .map((condicao) => condicao.CondicaoRegraOutro?.nCdPergunta)
            .filter((id): id is NonNullable<typeof id> => id != null)
            .map((id) => id.toNumber()),
        ),
      ];

      await tx.condicaoRegraRotaFixa.deleteMany({
        where: { nCdContrato: contratoId },
      });
      await tx.condicaoRegraOutro.deleteMany({
        where: { nCdContrato: contratoId },
      });
      await tx.condicaoRegra.deleteMany({
        where: { nCdContrato: contratoId },
      });
      await tx.regra.deleteMany({ where: { nCdContrato: contratoId } });

      if (rotaIds.length > 0) {
        await tx.rotaFixa.deleteMany({
          where: { nCdContrato: contratoId, nCdRota: { in: rotaIds } },
        });
      }

      if (enderecoIds.length > 0) {
        await tx.endereco.deleteMany({
          where: { nCdEndereco: { in: enderecoIds } },
        });
      }

      if (perguntaIds.length > 0) {
        await tx.perguntaContrato.deleteMany({
          where: { nCdContrato: contratoId, nCdPergunta: { in: perguntaIds } },
        });
      }

      const [ultimaRota, ultimaPergunta, ultimoEndereco] = await Promise.all([
        tx.rotaFixa.aggregate({
          where: { nCdContrato: contratoId },
          _max: { nCdRota: true },
        }),
        tx.perguntaContrato.aggregate({
          where: { nCdContrato: contratoId },
          _max: { nCdPergunta: true },
        }),
        tx.endereco.aggregate({ _max: { nCdEndereco: true } }),
      ]);

      let proximaRotaId = (ultimaRota._max.nCdRota?.toNumber() ?? 0) + 1;
      let proximaPerguntaId =
        (ultimaPergunta._max.nCdPergunta?.toNumber() ?? 0) + 1;
      let proximoEnderecoId =
        (ultimoEndereco._max.nCdEndereco?.toNumber() ?? 0) + 1;

      for (const [indice, regra] of regras.entries()) {
        const regraId = indice + 1;
        const condicaoId = 1;

        await tx.regra.create({
          data: {
            nCdContrato: contratoId,
            nCdRegra: regraId,
            iPrioridade: regra.prioridade,
            nCdTipoRegra: TIPO_REGRA_ID[regra.tipo],
            nValorKm: regra.valorKm ?? null,
            nValorFixo: regra.valorFixo ?? null,
            nPercentual: regra.percentual ?? null,
          },
        });

        await tx.condicaoRegra.create({
          data: {
            nCdContrato: contratoId,
            nCdRegra: regraId,
            nCdCondicao: condicaoId,
            cTipoCondicao: 'CONDICAO_COMPLETA',
            cValor: JSON.stringify({
              diasSemana: regra.condicao.diasSemana,
              periodos: regra.condicao.periodos,
              tipoVeiculoIds: regra.condicao.tipoVeiculoIds,
              tipoCorridaIds: regra.condicao.tipoCorridaIds,
              aplicaOutroQuando: 'SIM',
            }),
          },
        });

        for (const rota of regra.condicao.rotasFixas) {
          const enderecoOrigemId = proximoEnderecoId++;
          const enderecoDestinoId = proximoEnderecoId++;
          const rotaId = proximaRotaId++;

          await tx.endereco.create({
            data: {
              nCdEndereco: enderecoOrigemId,
              cEndereco: rota.origem.logradouro,
              cNumero: rota.origem.numero,
              cComplemento: rota.origem.complemento ?? null,
              cBairro: rota.origem.bairro,
              cCidade: rota.origem.cidade,
              cUf: rota.origem.uf,
              cCEP: rota.origem.cep,
              nLatitude: rota.origem.latitude,
              nLongitude: rota.origem.longitude,
            },
          });

          await tx.endereco.create({
            data: {
              nCdEndereco: enderecoDestinoId,
              cEndereco: rota.destino.logradouro,
              cNumero: rota.destino.numero,
              cComplemento: rota.destino.complemento ?? null,
              cBairro: rota.destino.bairro,
              cCidade: rota.destino.cidade,
              cUf: rota.destino.uf,
              cCEP: rota.destino.cep,
              nLatitude: rota.destino.latitude,
              nLongitude: rota.destino.longitude,
            },
          });

          await tx.rotaFixa.create({
            data: {
              nCdContrato: contratoId,
              nCdRota: rotaId,
              nCdEnderecoOrigem: enderecoOrigemId,
              nCdEnderecoDestino: enderecoDestinoId,
            },
          });

          await tx.condicaoRegraRotaFixa.create({
            data: {
              nCdContrato: contratoId,
              nCdRegra: regraId,
              nCdCondicao: condicaoId,
              nCdRota: rotaId,
            },
          });
        }

        const perguntaId = proximaPerguntaId++;
        await tx.perguntaContrato.create({
          data: {
            nCdContrato: contratoId,
            nCdPergunta: perguntaId,
            cPergunta: regra.condicao.outro.pergunta,
          },
        });
        await tx.condicaoRegraOutro.create({
          data: {
            nCdContrato: contratoId,
            nCdRegra: regraId,
            nCdCondicao: condicaoId,
            nCdPergunta: perguntaId,
          },
        });
      }
    });
  }

  async buscarVarios(filtros: {
    filialId?: number;
    fornecedorId?: number;
    vigenciaDe?: Date;
    vigenciaAte?: Date;
    page: number;
    limit: number;
  }): Promise<PaginatedResponseInterface<ContratoSummary>> {
    const hoje = DateTime.now().startOf('day');
    const limiteVenceEmBreve = hoje.plus({ days: DIAS_PARA_VENCER_EM_BREVE });

    const where = this.montarWhere(filtros);
    const vinculo = this.filtroDeVinculo(filtros);
    const skip = (filtros.page - 1) * filtros.limit;

    const [contratos, totalCount] = await Promise.all([
      this.prismaService.contrato.findMany({
        where,
        skip,
        take: filtros.limit,
        orderBy: { dVigenciaInicio: 'desc' },
        include: {
          FilialFornecedor: {
            where: vinculo,
            orderBy: [{ nCdFilial: 'asc' }, { nCdFornecedor: 'asc' }],
            select: CONTRATO_VINCULO_SELECT,
          },
        },
      }),
      this.prismaService.contrato.count({ where }),
    ]);

    const data = contratos.map((contrato) =>
      PrismaContratoMapper.toSummary(contrato, hoje, limiteVenceEmBreve),
    );

    return {
      data,
      totalCount,
      hasNextPage: filtros.page * filtros.limit < totalCount,
    };
  }

  async buscarBigNumbers(filtros: {
    filialId?: number;
    fornecedorId?: number;
    vigenciaDe?: Date;
    vigenciaAte?: Date;
  }): Promise<ContratoBigNumbers> {
    const hoje = DateTime.now().startOf('day').toJSDate();
    const limiteVenceEmBreve = DateTime.now()
      .startOf('day')
      .plus({ days: DIAS_PARA_VENCER_EM_BREVE })
      .toJSDate();

    const where = this.montarWhere(filtros);

    const vigente: Prisma.ContratoWhereInput = {
      dVigenciaInicio: { lte: hoje },
      OR: [{ dVigenciaFim: null }, { dVigenciaFim: { gte: hoje } }],
    };

    const [total, validos, vencemEmBreve, vencidos] = await Promise.all([
      this.prismaService.contrato.count({ where }),
      this.prismaService.contrato.count({ where: { AND: [where, vigente] } }),
      this.prismaService.contrato.count({
        where: {
          AND: [
            where,
            {
              dVigenciaInicio: { lte: hoje },
              dVigenciaFim: { gte: hoje, lte: limiteVenceEmBreve },
            },
          ],
        },
      }),
      this.prismaService.contrato.count({
        where: { AND: [where, { dVigenciaFim: { lt: hoje } }] },
      }),
    ]);

    return { total, validos, vencemEmBreve, vencidos };
  }
}
