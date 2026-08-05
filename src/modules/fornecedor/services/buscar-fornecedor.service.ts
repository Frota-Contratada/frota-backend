import { Injectable } from '@nestjs/common';
import { Fornecedor } from '../domain/fornecedor';
import { FornecedorNaoEncontradoException } from '../exceptions/fornecedor-nao-encontrado.exception';
import {
  FiltrosFornecedor,
  FornecedorRepositoryContract,
} from '../repositories/fornecedor-repository.contract';

@Injectable()
export class BuscarFornecedorService {
  constructor(
    private readonly fornecedorRepository: FornecedorRepositoryContract,
  ) {}

  async executar(id: number): Promise<Fornecedor> {
    const fornecedor = await this.fornecedorRepository.buscar(id);

    if (!fornecedor) {
      throw new FornecedorNaoEncontradoException(id);
    }

    return fornecedor;
  }

  async executarVarios(filtros: FiltrosFornecedor): Promise<Fornecedor[]> {
    return this.fornecedorRepository.buscarVarios(filtros);
  }
}
