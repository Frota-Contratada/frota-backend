import { ConflictException } from '@nestjs/common';

export class FornecedorIndisponivelException extends ConflictException {
  constructor(filialId: number, tipoCorridaId: number) {
    super(
      `Nenhum fornecedor com contrato vigente atende a modalidade ${tipoCorridaId} na filial ${filialId}`,
    );
  }
}
