import { DateTime } from 'luxon';
import { StatusAprovacao } from '../enums/status-aprovacao.enum';
import { StatusSolicitacao } from '../enums/status-solicitacao.enum';
import { CorridaSolicitacao } from './corrida-solicitacao';
import { Endereco } from './endereco';
import { Motivo } from './motivo';
import { Parada } from './parada';
import { SolicitacaoCentroCusto } from './solicitacao-centro-custo';
import { SolicitacaoPassageiro } from './solicitacao-passageiro';
import { TipoCorrida } from './tipo-corrida';
import { TipoVeiculo } from './tipo-veiculo';

export interface DetalhesSolicitacao {
  id?: number;
  dataCriacao?: DateTime;
  status?: StatusSolicitacao;
  tipoVeiculo?: TipoVeiculo;
  paradas?: Parada[];
  centrosCusto?: SolicitacaoCentroCusto[];
  passageiros?: SolicitacaoPassageiro[];
  motivoCancelamento?: Motivo;
  duracaoEstimadaMinutos?: number;
  solicitanteNome?: string;
  fornecedorNome?: string;
  corrida?: CorridaSolicitacao;
}

export class Solicitacao {
  id: number;
  dataCriacao: DateTime;
  status: StatusSolicitacao;
  tipoVeiculo?: TipoVeiculo;
  paradas: Parada[];
  centrosCusto: SolicitacaoCentroCusto[];
  passageiros: SolicitacaoPassageiro[];
  motivoCancelamento?: Motivo;
  duracaoEstimadaMinutos?: number;
  solicitanteNome?: string;
  fornecedorNome?: string;
  corrida?: CorridaSolicitacao;

  constructor(
    public solicitanteId: number,
    public fornecedorId: number,
    public tipoCorrida: TipoCorrida,
    public dataCorrida: DateTime,
    public origem: Endereco,
    public destino: Endereco,
    public motivoSolicitacao: Motivo,
    public distanciaEstimadaKm: number,
    public valorEstimado: number,
    detalhes: DetalhesSolicitacao = {},
  ) {
    this.id = detalhes.id ?? 0;
    this.dataCriacao = detalhes.dataCriacao ?? DateTime.now();
    this.status = detalhes.status ?? StatusSolicitacao.PENDENTE;
    this.tipoVeiculo = detalhes.tipoVeiculo;
    this.paradas = detalhes.paradas ?? [];
    this.centrosCusto = detalhes.centrosCusto ?? [];
    this.passageiros = detalhes.passageiros ?? [];
    this.motivoCancelamento = detalhes.motivoCancelamento;
    this.duracaoEstimadaMinutos = detalhes.duracaoEstimadaMinutos;
    this.solicitanteNome = detalhes.solicitanteNome;
    this.fornecedorNome = detalhes.fornecedorNome;
    this.corrida = detalhes.corrida;
  }

  get trajeto(): Endereco[] {
    const paradasOrdenadas = [...this.paradas].sort(
      (uma, outra) => uma.ordem - outra.ordem,
    );

    return [
      this.origem,
      ...paradasOrdenadas.map((parada) => parada.endereco),
      this.destino,
    ];
  }

  get dataChegadaEstimada(): DateTime | undefined {
    if (this.duracaoEstimadaMinutos == null) return undefined;

    return this.dataCorrida.plus({ minutes: this.duracaoEstimadaMinutos });
  }

  get motivoReprovacao(): Motivo | undefined {
    return this.centrosCusto.find(
      (centroCusto) =>
        centroCusto.statusAprovacao === StatusAprovacao.REPROVADA &&
        centroCusto.motivoRecusa != null,
    )?.motivoRecusa;
  }

  get emAndamento(): boolean {
    return this.corrida?.emAndamento ?? false;
  }

  get cancelavel(): boolean {
    const statusPermiteCancelamento =
      this.status === StatusSolicitacao.PENDENTE ||
      this.status === StatusSolicitacao.APROVADA;

    return statusPermiteCancelamento && this.corrida == null;
  }
}
