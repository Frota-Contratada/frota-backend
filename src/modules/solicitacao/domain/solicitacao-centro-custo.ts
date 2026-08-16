import { StatusAprovacao } from '../enums/status-aprovacao.enum';
import { Motivo } from './motivo';

export class SolicitacaoCentroCusto {
  constructor(
    public filialId: number,
    public centroCustoId: number,
    public aprovadorId: number,
    public statusAprovacao: StatusAprovacao = StatusAprovacao.PENDENTE,
    public centroCustoNome?: string,
    public aprovadorNome?: string,
    public motivoRecusa?: Motivo,
  ) {}
}
