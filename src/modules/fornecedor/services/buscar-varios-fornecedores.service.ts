import { Injectable } from '@nestjs/common';
import { Fornecedor } from '../domain/fornecedor';
import { FornecedorRepositoryContract } from '../repositories/fornecedor-repository.contract';

@Injectable()
export class BuscarVariosFornecedoresService {
  constructor(
    private readonly fornecedorRepository: FornecedorRepositoryContract,
  ) {}

  async execute(filtros: {
    nome?: string;
    cnpjCpf?: string;
  }): Promise<Fornecedor[]> {
    return this.fornecedorRepository.buscarVarios({
      nome: filtros.nome,
      cnpjCpf: filtros.cnpjCpf,
    });
  }
}
