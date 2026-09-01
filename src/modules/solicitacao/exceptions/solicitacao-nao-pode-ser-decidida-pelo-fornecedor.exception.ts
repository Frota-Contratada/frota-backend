import { ConflictException } from '@nestjs/common';

export class SolicitacaoNaoPodeSerDecididaPeloFornecedorException extends ConflictException {
  constructor(id: number) {
    super(`A solicitação ${id} não está aguardando uma decisão do fornecedor.`);
  }
}
