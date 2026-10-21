import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { fusoHorarioOperacao } from '@common/config/fuso-horario';
import { DiaSemana } from '../../contrato/enums/dia-semana.enum';
import { resolverPeriodo } from '../../contrato/enums/periodo.enum';
import { calcularValorPorRegras } from '../domain/calculo-valor-regras';
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

export interface RegraAplicada {
  regraId: number;
  valorCobrado: number;
}

export interface ResultadoPrecificacao {
  valorEstimado: number;
  rotaFixaId?: number;
  regrasAplicadas: RegraAplicada[];
}

interface RegraAplicavel {
  regra: Regra;
  rotaFixaId?: number;
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
    const regrasAplicaveis: RegraAplicavel[] = [];

    for (const regra of [...contrato.regras].sort(
      (uma, outra) => uma.prioridade - outra.prioridade,
    )) {
      const aplicavel = this.regraSeAplica(regra, contexto);
      if (aplicavel != null) {
        regrasAplicaveis.push(aplicavel);
      }
    }

    const resultado = calcularValorPorRegras(
      regrasAplicaveis.map(({ regra }) => ({
        id: regra.id,
        prioridade: regra.prioridade,
        tipoRegraId: regra.tipoRegraId,
        valorFixo: regra.valorFixo,
        valorKm: regra.valorKm,
        percentual: regra.percentual,
      })),
      contexto.distanciaKm,
    );

    if (resultado == null) return undefined;

    const regrasCobradas = new Set(
      resultado.regrasAplicadas.map((item) => item.regraId),
    );

    return {
      valorEstimado: resultado.valor,
      rotaFixaId: regrasAplicaveis.find(
        (item) => item.rotaFixaId != null && regrasCobradas.has(item.regra.id),
      )?.rotaFixaId,
      regrasAplicadas: resultado.regrasAplicadas,
    };
  }

  private regraSeAplica(
    regra: Regra,
    contexto: ContextoPrecificacao,
  ): RegraAplicavel | undefined {
    // Sem condição a regra vale para qualquer corrida; lista vazia não restringe.
    const condicao = regra.condicao;
    if (condicao == null) return { regra };

    // Período e dia da semana seguem o horário local da operação, não o UTC.
    const horarioLocal = contexto.dataCorrida.setZone(fusoHorarioOperacao());
    const diaSemana = this.diaSemanaDaData(horarioLocal);
    const periodo = resolverPeriodo(horarioLocal);

    if (!this.permite(condicao.diasSemana, diaSemana)) return undefined;
    if (!this.permite(condicao.periodos, periodo)) return undefined;
    if (
      condicao.tipoVeiculoIds.length > 0 &&
      (contexto.tipoVeiculoId == null ||
        !condicao.tipoVeiculoIds.includes(contexto.tipoVeiculoId))
    ) {
      return undefined;
    }
    if (!this.permite(condicao.tipoCorridaIds, contexto.tipoCorridaId)) {
      return undefined;
    }

    const rotaFixaId = this.encontrarRotaFixa(condicao, contexto);
    if (condicao.rotasFixas.length > 0 && rotaFixaId == null) {
      return undefined;
    }
    if (
      condicao.perguntaId != null &&
      !this.perguntaFoiRespondidaComSim(regra, condicao, contexto)
    ) {
      return undefined;
    }

    return { regra, rotaFixaId };
  }

  private permite<T>(opcoes: T[], valor: T): boolean {
    return opcoes.length === 0 || opcoes.includes(valor);
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
