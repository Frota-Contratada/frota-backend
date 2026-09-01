import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { CondicaoRegra } from '../domain/condicao-regra';
import { ContratoPrecificacao } from '../domain/contrato-precificacao';
import { Regra } from '../domain/regra';
import { TipoCondicaoRegra } from '../enums/tipo-condicao-regra.enum';

export interface ContextoPrecificacao {
  distanciaKm: number;
  dataCorrida: DateTime;
  tipoCorridaId: number;
  tipoVeiculoId?: number;
  quantidadeParadas: number;
}

@Injectable()
export class CalcularValorEstimadoService {
  execute(
    contrato: ContratoPrecificacao,
    contexto: ContextoPrecificacao,
  ): number {
    const regrasAplicaveis = contrato.regras
      .filter((regra) => this.regraSeAplica(regra, contexto))
      .sort((uma, outra) => uma.prioridade - outra.prioridade);

    let valor = 0;

    for (const regra of regrasAplicaveis) {
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

    return Math.round(valor * 100) / 100;
  }

  private regraSeAplica(regra: Regra, contexto: ContextoPrecificacao): boolean {
    return regra.condicoes.every((condicao) =>
      this.condicaoSatisfeita(condicao, contexto),
    );
  }

  private condicaoSatisfeita(
    condicao: CondicaoRegra,
    contexto: ContextoPrecificacao,
  ): boolean {
    const tipo = condicao.tipo.trim().toLowerCase() as TipoCondicaoRegra;

    switch (tipo) {
      case TipoCondicaoRegra.TIPO_VEICULO:
        return (
          contexto.tipoVeiculoId != null &&
          this.listaDeNumeros(condicao.valor).includes(contexto.tipoVeiculoId)
        );

      case TipoCondicaoRegra.TIPO_CORRIDA:
        return this.listaDeNumeros(condicao.valor).includes(
          contexto.tipoCorridaId,
        );

      case TipoCondicaoRegra.DISTANCIA_MINIMA_KM: {
        const minimo = Number(condicao.valor);
        return !Number.isNaN(minimo) && contexto.distanciaKm >= minimo;
      }

      case TipoCondicaoRegra.DISTANCIA_MAXIMA_KM: {
        const maximo = Number(condicao.valor);
        return !Number.isNaN(maximo) && contexto.distanciaKm <= maximo;
      }

      case TipoCondicaoRegra.HORA_INICIO:
        return this.horaDaCorridaAPartirDe(condicao.valor, contexto);

      case TipoCondicaoRegra.HORA_FIM:
        return this.horaDaCorridaAte(condicao.valor, contexto);

      case TipoCondicaoRegra.DIA_SEMANA:
        return this.listaDeNumeros(condicao.valor).includes(
          contexto.dataCorrida.weekday,
        );

      case TipoCondicaoRegra.QUANTIDADE_MINIMA_PARADAS: {
        const minimo = Number(condicao.valor);
        return !Number.isNaN(minimo) && contexto.quantidadeParadas >= minimo;
      }

      default:
        return false;
    }
  }

  private horaDaCorridaAPartirDe(
    valor: string,
    contexto: ContextoPrecificacao,
  ): boolean {
    const limite = this.minutosDoDia(valor);

    return (
      limite != null && this.minutosDaCorrida(contexto.dataCorrida) >= limite
    );
  }

  private horaDaCorridaAte(
    valor: string,
    contexto: ContextoPrecificacao,
  ): boolean {
    const limite = this.minutosDoDia(valor);

    return (
      limite != null && this.minutosDaCorrida(contexto.dataCorrida) <= limite
    );
  }

  private minutosDaCorrida(dataCorrida: DateTime): number {
    return dataCorrida.hour * 60 + dataCorrida.minute;
  }

  private minutosDoDia(valor: string): number | null {
    const partes = valor.trim().split(':');

    if (partes.length !== 2) return null;

    const horas = Number(partes[0]);
    const minutos = Number(partes[1]);

    if (Number.isNaN(horas) || Number.isNaN(minutos)) return null;
    if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59) return null;

    return horas * 60 + minutos;
  }

  private listaDeNumeros(valor: string): number[] {
    return valor
      .split(',')
      .map((item) => Number(item.trim()))
      .filter((item) => !Number.isNaN(item));
  }
}
