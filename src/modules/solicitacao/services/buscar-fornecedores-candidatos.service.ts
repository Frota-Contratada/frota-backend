import { Injectable } from '@nestjs/common';
import { UsuarioRepositoryContract } from '@module/usuario/info/repositories/usuario-repository.contract';
import { FornecedorCandidato } from '../domain/fornecedor-candidato';
import { AprovadorNaoAutorizadoException } from '../exceptions/aprovador-nao-autorizado.exception';
import { SolicitacaoNaoEncontradaException } from '../exceptions/solicitacao-nao-encontrada.exception';
import { SolicitanteSemFilialException } from '../exceptions/solicitante-sem-filial.exception';
import { ContratoPrecificacaoRepositoryContract } from '../repositories/contrato-precificacao-repository.contract';
import { SolicitacaoRepositoryContract } from '../repositories/solicitacao-repository.contract';
import { CalcularValorEstimadoService } from './calcular-valor-estimado.service';

@Injectable()
export class BuscarFornecedoresCandidatosService {
  constructor(
    private readonly solicitacaoRepository: SolicitacaoRepositoryContract,
    private readonly usuarioRepository: UsuarioRepositoryContract,
    private readonly contratoPrecificacaoRepository: ContratoPrecificacaoRepositoryContract,
    private readonly calcularValorEstimadoService: CalcularValorEstimadoService,
  ) {}

  async execute(
    solicitacaoId: number,
    aprovadorId: number,
  ): Promise<FornecedorCandidato[]> {
    const solicitacao = await this.solicitacaoRepository.buscar(solicitacaoId);

    if (solicitacao == null) {
      throw new SolicitacaoNaoEncontradaException(solicitacaoId);
    }

    if (
      !solicitacao.centrosCusto.some(
        (rateio) => rateio.aprovadorId === aprovadorId,
      )
    ) {
      throw new AprovadorNaoAutorizadoException(solicitacaoId);
    }

    const solicitante = await this.usuarioRepository.buscar(
      solicitacao.solicitanteId,
    );

    if (solicitante?.empresaId == null || solicitante.filialId == null) {
      throw new SolicitanteSemFilialException(solicitacao.solicitanteId);
    }

    const contratos =
      await this.contratoPrecificacaoRepository.buscarCandidatos(
        solicitante.empresaId,
        solicitante.filialId,
        solicitacao.tipoCorrida.id,
        solicitacao.dataCorrida,
      );

    const candidatos = contratos
      .flatMap((contrato) => {
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
          respostasPerguntas: solicitacao.respostasPerguntas.map(
            (resposta) => ({
              contratoId: contrato.contratoId,
              perguntaId: resposta.perguntaId,
              resposta: resposta.resposta,
            }),
          ),
        });

        return resultado == null
          ? []
          : [
              new FornecedorCandidato(
                contrato.fornecedorId,
                contrato.fornecedorNome,
                contrato.contratoId,
                resultado.valorEstimado,
                contrato.fornecedorId === solicitacao.fornecedorId,
              ),
            ];
      })
      .sort((um, outro) => um.valorEstimado - outro.valorEstimado);

    // Fornecedor com mais de um contrato vigente aparece uma vez: com o
    // contrato gravado na solicitação ou, se não for ele, com o de menor valor.
    const porFornecedor = new Map<number, FornecedorCandidato>();

    for (const candidato of candidatos) {
      const atual = porFornecedor.get(candidato.fornecedorId);

      if (
        atual == null ||
        (candidato.contratoId === solicitacao.contratoId &&
          atual.contratoId !== solicitacao.contratoId)
      ) {
        porFornecedor.set(candidato.fornecedorId, candidato);
      }
    }

    return [...porFornecedor.values()].sort(
      (um, outro) => um.valorEstimado - outro.valorEstimado,
    );
  }
}
