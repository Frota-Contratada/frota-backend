import { Injectable } from '@nestjs/common';
import { Fornecedor } from '../domain/fornecedor';
import { FornecedorNaoEncontradoException } from '../exceptions/fornecedor-nao-encontrado.exception';
import { FornecedorRepositoryContract } from '../repositories/fornecedor-repository.contract';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';

@Injectable()
export class BuscarFornecedorService {
  constructor(
    private readonly fornecedorRepository: FornecedorRepositoryContract,
  ) {}

  async execute(id: number): Promise<Fornecedor> {
    const fornecedor = await this.fornecedorRepository.buscar(id);

    if (!fornecedor) {
      throw new FornecedorNaoEncontradoException(id);
    }

    return fornecedor;
  }
}
