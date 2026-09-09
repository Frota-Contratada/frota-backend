import { Injectable } from '@nestjs/common';
import { ContratoPrecificacaoRepositoryContract } from '../repositories/contrato-precificacao-repository.contract';
import { FornecedorIndisponivelException } from '../exceptions/fornecedor-indisponivel.exception';
import {
  CalcularValorEstimadoService,
  ContextoPrecificacao,
} from './calcular-valor-estimado.service';

export interface FornecedorSelecionado {
  fornecedorId: number;
  fornecedorNome: string;
  contratoId: number;
  valorEstimado: number;
  rotaFixaId: number;
}

@Injectable()
export class SelecionarFornecedorService {
  constructor(
    private readonly contratoPrecificacaoRepository: ContratoPrecificacaoRepositoryContract,
    private readonly calcularValorEstimadoService: CalcularValorEstimadoService,
  ) {}

  async execute(
    filialId: number,
    contexto: ContextoPrecificacao,
  ): Promise<FornecedorSelecionado> {
    const candidatos =
      await this.contratoPrecificacaoRepository.buscarCandidatos(
        filialId,
        contexto.tipoCorridaId,
        contexto.dataCorrida,
      );

    const precificados = candidatos
      .flatMap((contrato) => {
        const resultado = this.calcularValorEstimadoService.avaliar(
          contrato,
          contexto,
        );

        return resultado == null
          ? []
          : [
              {
                fornecedorId: contrato.fornecedorId,
                fornecedorNome: contrato.fornecedorNome,
                contratoId: contrato.contratoId,
                valorEstimado: resultado.valorEstimado,
                rotaFixaId: resultado.rotaFixaId,
              },
            ];
      })
      .sort((um, outro) => um.valorEstimado - outro.valorEstimado);

    const escolhido = precificados.at(0);

    if (escolhido == null) {
      throw new FornecedorIndisponivelException(
        filialId,
        contexto.tipoCorridaId,
      );
    }

    return escolhido;
  }
}
