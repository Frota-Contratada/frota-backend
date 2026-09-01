/**
 * Discrimina para que serve o motivo. A tabela `Motivo` atende os três usos:
 * - `SOLICITACAO`: motivo da viagem (`Solicitacao.nCdMotivoSolicitacao`)
 * - `CANCELAMENTO`: motivo do cancelamento (`Solicitacao.nCdMotivoCancelamento`)
 * - `RECUSA`: motivo da recusa da aprovação (`SolicitacaoCentroCusto.nCdMotivoRecusa`)
 */
export enum TipoMotivo {
  SOLICITACAO = 'solicitacao',
  CANCELAMENTO = 'cancelamento',
  RECUSA = 'recusa',
}
