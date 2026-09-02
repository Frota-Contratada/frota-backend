import { DateTime } from 'luxon';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { Solicitacao } from '../domain/solicitacao';
import { OrdenacaoSolicitacao } from '../enums/ordenacao-solicitacao.enum';
import { StatusSolicitacao } from '../enums/status-solicitacao.enum';

export interface FiltrosBuscarSolicitacoes {
  solicitanteId: number;
  status?: StatusSolicitacao;
  tipoCorridaId?: number;
  dataInicio?: DateTime;
  dataFim?: DateTime;
  historico?: boolean;
  incluirAnteriores?: boolean;
  ordenacao: OrdenacaoSolicitacao;
  page: number;
  limit: number;
}

export interface FiltrosBuscarSolicitacoesParaAprovacao {
  aprovadorId: number;
  tipoCorridaId?: number;
  dataInicio?: DateTime;
  dataFim?: DateTime;
  ordenacao: OrdenacaoSolicitacao;
  page: number;
  limit: number;
}

export interface DecisaoFornecedor {
  decisao: 'REATRIBUIR' | 'RECUSAR';
  motoristaId?: number;
  veiculoId?: number;
  motivo?: string;
}

export abstract class SolicitacaoRepositoryContract {
  abstract criar(solicitacao: Solicitacao): Promise<Solicitacao>;
  abstract existeConflitoDeHorario(
    solicitanteId: number,
    dataCorrida: DateTime,
  ): Promise<boolean>;
  abstract buscar(id: number): Promise<Solicitacao | null>;
  abstract buscarVarias(
    filtros: FiltrosBuscarSolicitacoes,
  ): Promise<PaginatedResponseInterface<Solicitacao>>;
  abstract buscarPendentesParaAprovacao(
    filtros: FiltrosBuscarSolicitacoesParaAprovacao,
  ): Promise<PaginatedResponseInterface<Solicitacao>>;
  abstract buscarAgendadasPorPeriodo(filtros: {
    solicitanteId: number;
    inicio: DateTime;
    fim: DateTime;
  }): Promise<Solicitacao[]>;
  abstract cancelar(
    id: number,
    motivoCancelamentoId: number,
  ): Promise<Solicitacao>;
  abstract decidirPeloFornecedor(
    id: number,
    fornecedorId: number,
    decisao: DecisaoFornecedor,
  ): Promise<Solicitacao>;
}
