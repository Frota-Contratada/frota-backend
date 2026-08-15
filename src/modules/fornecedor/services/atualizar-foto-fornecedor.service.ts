import { Injectable, Logger } from '@nestjs/common';
import { StorageServiceContract } from '@core/storage/contracts/storage-service.contract';
import { ArquivoRecebidoInterface } from '@core/storage/interfaces/arquivo-recebido.interface';
import { ValidarArquivoService } from '@core/storage/services/validar-arquivo.service';
import { Fornecedor } from '../domain/fornecedor';
import { MimeTypeFotoFornecedorEnum } from '../enums/mime-type-foto-fornecedor.enum';
import { FalhaAoRemoverFotoFornecedorException } from '../exceptions/falha-ao-remover-foto-fornecedor.exception';
import { FornecedorNaoEncontradoException } from '../exceptions/fornecedor-nao-encontrado.exception';
import { FornecedorRepositoryContract } from '../repositories/fornecedor-repository.contract';

@Injectable()
export class AtualizarFotoFornecedorService {
  private readonly logger = new Logger(AtualizarFotoFornecedorService.name);

  constructor(
    private readonly fornecedorRepository: FornecedorRepositoryContract,
    private readonly storageService: StorageServiceContract,
    private readonly validarArquivoService: ValidarArquivoService,
  ) {}

  async execute(
    fornecedorId: number,
    arquivo?: ArquivoRecebidoInterface,
  ): Promise<Fornecedor> {
    this.validarArquivoService.validar(
      arquivo,
      Object.values(MimeTypeFotoFornecedorEnum),
    );

    const fornecedor = await this.fornecedorRepository.buscar(fornecedorId);

    if (!fornecedor) {
      throw new FornecedorNaoEncontradoException(fornecedorId);
    }

    const arquivoSalvo = await this.storageService.salvar({
      conteudo: arquivo.buffer,
      nomeOriginal: arquivo.originalname,
      mimeType: arquivo.mimetype,
      pasta: `fornecedores/${fornecedorId}/foto`,
    });

    let fornecedorAtualizado: Fornecedor;

    try {
      fornecedorAtualizado = await this.fornecedorRepository.atualizarFoto(
        fornecedorId,
        arquivoSalvo.chave,
      );

      fornecedorAtualizado.foto = await this.storageService.lerComoDataUrl(
        arquivoSalvo.chave,
      );
    } catch (erro) {
      await this.removerArquivoEnviado(arquivoSalvo.chave);
      throw erro;
    }

    await this.removerArquivoAnterior(fornecedor.caminhoArquivo);

    return fornecedorAtualizado;
  }

  private async removerArquivoEnviado(chave: string): Promise<void> {
    try {
      await this.storageService.remover(chave);
    } catch {
      throw new FalhaAoRemoverFotoFornecedorException();
    }
  }

  private async removerArquivoAnterior(chave?: string): Promise<void> {
    if (!chave) {
      return;
    }

    try {
      await this.storageService.remover(chave);
    } catch {
      this.logger.warn(`Foto anterior do fornecedor não removida: ${chave}`);
    }
  }
}
