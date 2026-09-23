import { BadRequestException } from '@nestjs/common';

export class FornecedorObrigatorioException extends BadRequestException {
  constructor() {
    super(
      'O aprovador do centro de custo do solicitante deve escolher um fornecedor.',
    );
  }
}
