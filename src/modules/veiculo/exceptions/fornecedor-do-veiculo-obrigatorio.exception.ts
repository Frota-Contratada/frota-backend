import { BadRequestException } from '@nestjs/common';

export class FornecedorDoVeiculoObrigatorioException extends BadRequestException {
  constructor() {
    super('Informe o fornecedor do veículo');
  }
}
