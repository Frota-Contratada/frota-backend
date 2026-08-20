import { DateTime } from 'luxon';
import { StatusCorrida } from '@module/solicitacao/enums/status-corrida.enum';

export class MotoristaCorrida {
  constructor(
    public id: number,
    public dataHoraPartida: DateTime,
    public origem: string,
    public destino: string,
    public nomePassageiro: string,
    public valorEstimado: number,
    public tipoCorrida: string,
    public status: StatusCorrida,
    public placaVeiculo?: string,
    public dataFim?: DateTime,
    public ehProxima = false,
    public minutosRestantes?: number,
    public motivoRecusa?: string,
  ) {}
}

export class MotoristaPerfil {
  constructor(
    public id: number,
    public nome: string,
    public email: string,
    public historico: MotoristaCorrida[],
    public cpf?: string,
    public fornecedorNome?: string,
    public fotoPerfil?: string,
    public viagensFinalizadas = 0,
    public transportesDeItens = 0,
  ) {}
}
