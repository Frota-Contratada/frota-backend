import { Injectable } from '@nestjs/common';
import { FornecedorDeOutraFilialException } from '../exceptions/fornecedor-de-outra-filial.exception';
import { FornecedorRepositoryContract } from '../repositories/fornecedor-repository.contract';

/**
 * Garante que um admin de filial só gerencie fornecedores vinculados à própria
 * filial. O vínculo é o registro de FilialFornecedor, independente da vigência
 * do contrato.
 */
@Injectable()
export class ValidarFornecedorDaFilialService {
  constructor(
    private readonly fornecedorRepository: FornecedorRepositoryContract,
  ) {}

  async execute(fornecedorId: number, filialId: number): Promise<void> {
    const pertence = await this.fornecedorRepository.pertenceAFilial(
      fornecedorId,
      filialId,
    );

    if (!pertence) {
      throw new FornecedorDeOutraFilialException(fornecedorId, filialId);
    }
  }
}
