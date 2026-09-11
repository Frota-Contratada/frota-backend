import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { TrackingService } from '@module/tracking/services/tracking.service';
import { SolicitacaoNaoEncontradaException } from '../exceptions/solicitacao-nao-encontrada.exception';
import {
  RegraCorridaInput,
  SolicitacaoRepositoryContract,
} from '../repositories/solicitacao-repository.contract';
import { ContratoPrecificacaoRepositoryContract } from '../repositories/contrato-precificacao-repository.contract';
import { RespostaPerguntaPrecificacao } from '../domain/resposta-pergunta-solicitacao';
import { CalcularValorEstimadoService } from './calcular-valor-estimado.service';

export interface CriarCorridaInput {
  solicitacaoId: number;
  fornecedorId: number;
  motoristaId: number;
  veiculoId: number;
}

@Injectable()
export class CriarCorridaService {
  constructor(
    private readonly solicitacaoRepository: SolicitacaoRepositoryContract,
    private readonly contratoPrecificacaoRepository: ContratoPrecificacaoRepositoryContract,
    private readonly calcularValorEstimadoService: CalcularValorEstimadoService,
    private readonly prismaService: PrismaService,
    private readonly trackingService: TrackingService,
  ) {}

  async execute(input: CriarCorridaInput) {
    const solicitacao = await this.solicitacaoRepository.buscar(
      input.solicitacaoId,
    );

    if (solicitacao == null) {
      throw new SolicitacaoNaoEncontradaException(input.solicitacaoId);
    }

    const regras = await this.buscarRegrasAplicadas(solicitacao);
    const criada = await this.solicitacaoRepository.criarCorrida(
      input.solicitacaoId,
      input.fornecedorId,
      input.motoristaId,
      input.veiculoId,
      regras,
    );

    const corridaId = criada.corrida?.id;
    if (corridaId != null) {
      await this.trackingService.assegurarRotaInicial(corridaId);
    }

    return criada;
  }

  private async buscarRegrasAplicadas(
    solicitacao: NonNullable<
      Awaited<ReturnType<SolicitacaoRepositoryContract['buscar']>>
    >,
  ): Promise<RegraCorridaInput[]> {
    const solicitante = await this.prismaService.usuario.findUnique({
      where: { nCdUsuario: solicitacao.solicitanteId },
      select: { nCdFilial: true },
    });

    if (solicitante?.nCdFilial == null) return [];

    const contratos =
      await this.contratoPrecificacaoRepository.buscarCandidatos(
        solicitante.nCdFilial.toNumber(),
        solicitacao.tipoCorrida.id,
        solicitacao.dataCorrida,
      );
    const contrato = contratos.find(
      (candidato) => candidato.contratoId === solicitacao.contratoId,
    );

    if (contrato == null) return [];

    const respostasPerguntas: RespostaPerguntaPrecificacao[] =
      solicitacao.respostasPerguntas.map((resposta) => ({
        contratoId: solicitacao.contratoId,
        perguntaId: resposta.perguntaId,
        resposta: resposta.resposta,
      }));

    const resultado = this.calcularValorEstimadoService.avaliar(contrato, {
      distanciaKm: solicitacao.distanciaEstimadaKm,
      dataCorrida: solicitacao.dataCorrida,
      tipoCorridaId: solicitacao.tipoCorrida.id,
      tipoVeiculoId: solicitacao.tipoVeiculo?.id,
      quantidadeParadas: solicitacao.paradas.length,
      origem: {
        latitude: solicitacao.origem.latitude,
        longitude: solicitacao.origem.longitude,
      },
      destino: {
        latitude: solicitacao.destino.latitude,
        longitude: solicitacao.destino.longitude,
      },
      respostasPerguntas,
    });

    return (
      resultado?.regrasAplicadas.map((regra) => ({
        contratoId: solicitacao.contratoId,
        regraId: regra.regraId,
        valorCobrado: regra.valorCobrado,
      })) ?? []
    );
  }
}
