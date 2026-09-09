import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { DiaSemana } from '../../contrato/enums/dia-semana.enum';
import { resolverPeriodo } from '../../contrato/enums/periodo.enum';
import { CondicaoRegra } from '../domain/condicao-regra';
import { ContratoPrecificacao } from '../domain/contrato-precificacao';
import {
  RespostaPergunta,
  RespostaPerguntaPrecificacao,
} from '../domain/resposta-pergunta-solicitacao';
import { Regra } from '../domain/regra';

export interface PontoPrecificacao {
  latitude: number;
  longitude: number;
}

export interface ContextoPrecificacao {
  distanciaKm: number;
  dataCorrida: DateTime;
  tipoCorridaId: number;
  tipoVeiculoId?: number;
  quantidadeParadas: number;
  origem: PontoPrecificacao;
  destino: PontoPrecificacao;
  respostasPerguntas: RespostaPerguntaPrecificacao[];
}

export interface ResultadoPrecificacao {
  valorEstimado: number;
  rotaFixaId: number;
}

@Injectable()
export class CalcularValorEstimadoService {
  execute(
    contrato: ContratoPrecificacao,
    contexto: ContextoPrecificacao,
  ): number {
    return this.avaliar(contrato, contexto)?.valorEstimado ?? 0;
  }

  avaliar(
    contrato: ContratoPrecificacao,
    contexto: ContextoPrecificacao,
  ): ResultadoPrecificacao | undefined {
    const regrasAplicaveis: { regra: Regra; rotaFixaId: number }[] = [];

    for (const regra of [...contrato.regras].sort(
      (uma, outra) => uma.prioridade - outra.prioridade,
    )) {
      const rotaFixaId = this.regraSeAplica(regra, contexto);
      if (rotaFixaId != null) {
        regrasAplicaveis.push({ regra, rotaFixaId });
      }
    }

    if (regrasAplicaveis.length === 0) {
      return undefined;
    }

    let valor = 0;

    for (const { regra } of regrasAplicaveis) {
      if (regra.valorFixo != null) {
        valor += regra.valorFixo;
      }

      if (regra.valorKm != null) {
        valor += regra.valorKm * contexto.distanciaKm;
      }

      if (regra.percentual != null) {
        valor += valor * (regra.percentual / 100);
      }
    }

    return {
      valorEstimado: Math.round(valor * 100) / 100,
      rotaFixaId: regrasAplicaveis[0].rotaFixaId,
    };
  }

  private regraSeAplica(
    regra: Regra,
    contexto: ContextoPrecificacao,
  ): number | undefined {
    const condicao = regra.condicao;
    if (condicao == null) return undefined;

    const rotaFixaId = this.encontrarRotaFixa(condicao, contexto);
    const diaSemana = this.diaSemanaDaData(contexto.dataCorrida);
    const periodo = resolverPeriodo(contexto.dataCorrida);

    if (!condicao.diasSemana.includes(diaSemana)) return undefined;
    if (!condicao.periodos.includes(periodo)) return undefined;
    if (
      contexto.tipoVeiculoId == null ||
      !condicao.tipoVeiculoIds.includes(contexto.tipoVeiculoId)
    ) {
      return undefined;
    }
    if (!condicao.tipoCorridaIds.includes(contexto.tipoCorridaId)) {
      return undefined;
    }
    if (rotaFixaId == null) return undefined;
    if (!this.perguntaFoiRespondidaComSim(regra, condicao, contexto)) {
      return undefined;
    }

    return rotaFixaId;
  }

  private perguntaFoiRespondidaComSim(
    regra: Regra,
    condicao: CondicaoRegra,
    contexto: ContextoPrecificacao,
  ): boolean {
    return contexto.respostasPerguntas.some(
      (resposta) =>
        resposta.contratoId === regra.contratoId &&
        resposta.perguntaId === condicao.perguntaId &&
        resposta.resposta === RespostaPergunta.SIM,
    );
  }

  private encontrarRotaFixa(
    condicao: CondicaoRegra,
    contexto: ContextoPrecificacao,
  ): number | undefined {
    return condicao.rotasFixas.find(
      (rota) =>
        this.mesmoPonto(rota.origem, contexto.origem) &&
        this.mesmoPonto(rota.destino, contexto.destino),
    )?.id;
  }

  private mesmoPonto(
    esperado: PontoPrecificacao,
    recebido: PontoPrecificacao,
  ): boolean {
    const tolerancia = 0.00001;

    return (
      Math.abs(esperado.latitude - recebido.latitude) <= tolerancia &&
      Math.abs(esperado.longitude - recebido.longitude) <= tolerancia
    );
  }

  private diaSemanaDaData(data: DateTime): DiaSemana {
    const diasPorWeekday: Record<number, DiaSemana> = {
      1: DiaSemana.SEGUNDA,
      2: DiaSemana.TERCA,
      3: DiaSemana.QUARTA,
      4: DiaSemana.QUINTA,
      5: DiaSemana.SEXTA,
      6: DiaSemana.SABADO,
      7: DiaSemana.DOMINGO,
    };

    return diasPorWeekday[data.weekday];
  }
}
