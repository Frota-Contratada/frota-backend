/**
 * Discrimina para que serve o motivo. A tabela `Motivo` atende os quatro usos:
 * - `SOLICITACAO`: motivo da viagem (`Solicitacao.nCdMotivoSolicitacao`)
 * - `CANCELAMENTO`: motivo do cancelamento (`Solicitacao.nCdMotivoCancelamento`)
 * - `RECUSA`: motivo da recusa da aprovação (`SolicitacaoCentroCusto.nCdMotivoRecusa`)
 * - `OBJETO`: tipo de objeto transportado (`Solicitacao.nCdMotivoSolicitacao`)
 */
export enum TipoMotivo {
  SOLICITACAO = 'solicitacao',
  CANCELAMENTO = 'cancelamento',
  RECUSA = 'recusa',
  OBJETO = 'objeto',
}
