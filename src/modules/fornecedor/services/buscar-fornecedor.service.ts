import { Injectable } from '@nestjs/common';
import { StorageServiceContract } from '@core/storage/contracts/storage-service.contract';
import { Fornecedor } from '../domain/fornecedor';
import { FalhaAoCarregarFotoFornecedorException } from '../exceptions/falha-ao-carregar-foto-fornecedor.exception';
import { FornecedorNaoEncontradoException } from '../exceptions/fornecedor-nao-encontrado.exception';
import { FornecedorRepositoryContract } from '../repositories/fornecedor-repository.contract';

@Injectable()
export class BuscarFornecedorService {
  constructor(
    private readonly fornecedorRepository: FornecedorRepositoryContract,
    private readonly storageService: StorageServiceContract,
  ) {}

  async execute(id: number): Promise<Fornecedor> {
    const fornecedor = await this.fornecedorRepository.buscar(id);

    if (!fornecedor) {
      throw new FornecedorNaoEncontradoException(id);
    }

    if (fornecedor.caminhoArquivo) {
      try {
        fornecedor.foto = await this.storageService.lerComoDataUrl(
          fornecedor.caminhoArquivo,
        );
      } catch {
        throw new FalhaAoCarregarFotoFornecedorException();
      }
    }

    return fornecedor;
  }
}
