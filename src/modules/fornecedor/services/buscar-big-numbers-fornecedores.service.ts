import { Injectable } from '@nestjs/common';
import { FornecedorBigNumbers } from '../domain/types/fornecedor-big-numbers.type';
import { FornecedorRepositoryContract } from '../repositories/fornecedor-repository.contract';

@Injectable()
export class BuscarBigNumbersFornecedoresService {
  constructor(
    private readonly fornecedorRepository: FornecedorRepositoryContract,
  ) {}

  async execute(filtros: {
    nome?: string;
    cnpjCpf?: string;
    filialId?: number;
  }): Promise<FornecedorBigNumbers> {
    return this.fornecedorRepository.buscarBigNumbers({
      nome: filtros.nome,
      cnpjCpf: filtros.cnpjCpf,
      filialId: filtros.filialId,
    });
  }
}
