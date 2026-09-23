import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { Solicitacao } from '../domain/solicitacao';
import { MotivoNaoEncontradoException } from '../exceptions/motivo-nao-encontrado.exception';
import { SolicitacaoNaoEncontradaException } from '../exceptions/solicitacao-nao-encontrada.exception';
import { FornecedorIndisponivelException } from '../exceptions/fornecedor-indisponivel.exception';
import { FornecedorObrigatorioException } from '../exceptions/fornecedor-obrigatorio.exception';
import { AprovadorNaoAutorizadoException } from '../exceptions/aprovador-nao-autorizado.exception';
import { CatalogoSolicitacaoRepositoryContract } from '../repositories/catalogo-solicitacao-repository.contract';
import {
  DecisaoAprovador,
  SolicitacaoRepositoryContract,
} from '../repositories/solicitacao-repository.contract';
import { ContratoPrecificacaoRepositoryContract } from '../repositories/contrato-precificacao-repository.contract';
import { CalcularValorEstimadoService } from './calcular-valor-estimado.service';

@Injectable()
export class DecidirSolicitacaoAprovadorService {
  constructor(
    private readonly solicitacaoRepository: SolicitacaoRepositoryContract,
    private readonly catalogoRepository: CatalogoSolicitacaoRepositoryContract,
    private readonly contratoPrecificacaoRepository: ContratoPrecificacaoRepositoryContract,
    private readonly calcularValorEstimadoService: CalcularValorEstimadoService,
    private readonly prismaService: PrismaService,
  ) {}

  async execute(
    id: number,
    aprovadorId: number,
    decisao: DecisaoAprovador,
  ): Promise<Solicitacao> {
    const solicitacao = await this.solicitacaoRepository.buscar(id);

    if (solicitacao == null) {
      throw new SolicitacaoNaoEncontradaException(id);
    }

    if (decisao.decisao === 'REPROVAR') {
      if (decisao.motivoRecusaId == null) {
        throw new MotivoNaoEncontradoException(0);
      }

      const motivo = await this.catalogoRepository.buscarMotivo(
        decisao.motivoRecusaId,
      );
      if (motivo == null) {
        throw new MotivoNaoEncontradoException(decisao.motivoRecusaId);
      }

      return this.solicitacaoRepository.decidirPeloAprovador(
        id,
        aprovadorId,
        decisao,
      );
    }

    const fornecedor = await this.resolverFornecedor(
      solicitacao,
      aprovadorId,
      decisao.fornecedorId,
    );

    return this.solicitacaoRepository.decidirPeloAprovador(id, aprovadorId, {
      ...decisao,
      fornecedorId: fornecedor?.fornecedorId,
      contratoId: fornecedor?.contratoId,
      valorEstimado: fornecedor?.valorEstimado,
      rotaFixaId: fornecedor?.rotaFixaId,
    });
  }

  private async resolverFornecedor(
    solicitacao: Solicitacao,
    aprovadorId: number,
    fornecedorId?: number,
  ): Promise<
    | {
        fornecedorId: number;
        contratoId: number;
        valorEstimado: number;
        rotaFixaId?: number;
      }
    | undefined
  > {
    const solicitante = await this.prismaService.usuario.findUnique({
      where: { nCdUsuario: solicitacao.solicitanteId },
      select: { nCdFilial: true, nCdCentroCusto: true },
    });

    const ehAprovadorDoCentroDoSolicitante = solicitacao.centrosCusto.some(
      (rateio) =>
        rateio.aprovadorId === aprovadorId &&
        rateio.filialId === solicitante?.nCdFilial?.toNumber() &&
        rateio.centroCustoId === solicitante?.nCdCentroCusto?.toNumber(),
    );

    if (!ehAprovadorDoCentroDoSolicitante) {
      if (fornecedorId != null) {
        throw new AprovadorNaoAutorizadoException(solicitacao.id);
      }
      return undefined;
    }

    if (fornecedorId == null) {
      throw new FornecedorObrigatorioException();
    }

    if (solicitante?.nCdFilial == null) {
      throw new FornecedorIndisponivelException(0, solicitacao.tipoCorrida.id);
    }

    const candidatos =
      await this.contratoPrecificacaoRepository.buscarCandidatos(
        solicitante.nCdFilial.toNumber(),
        solicitacao.tipoCorrida.id,
        solicitacao.dataCorrida,
      );
    const candidato = candidatos.find(
      (item) => item.fornecedorId === fornecedorId,
    );

    if (candidato == null) {
      throw new FornecedorIndisponivelException(
        solicitante.nCdFilial.toNumber(),
        solicitacao.tipoCorrida.id,
      );
    }

    const resultado = this.calcularValorEstimadoService.avaliar(candidato, {
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
      respostasPerguntas: solicitacao.respostasPerguntas.map((resposta) => ({
        contratoId: candidato.contratoId,
        perguntaId: resposta.perguntaId,
        resposta: resposta.resposta,
      })),
    });

    if (resultado == null) {
      throw new FornecedorIndisponivelException(
        solicitante.nCdFilial.toNumber(),
        solicitacao.tipoCorrida.id,
      );
    }

    return {
      fornecedorId: candidato.fornecedorId,
      contratoId: candidato.contratoId,
      valorEstimado: resultado.valorEstimado,
      rotaFixaId: resultado.rotaFixaId,
    };
  }
}
