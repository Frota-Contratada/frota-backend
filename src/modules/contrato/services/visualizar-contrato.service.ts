import { Injectable } from '@nestjs/common';
import { basename, extname } from 'node:path';
import { Readable } from 'node:stream';
import { StorageServiceContract } from '@core/storage/contracts/storage-service.contract';
import { ContratoNaoEncontradoException } from '../exceptions/contrato-nao-encontrado.exception';
import { ContratoRepositoryContract } from '../repositories/contrato-repository.contract';

export type DocumentoContrato = {
  stream: Readable;
  nomeArquivo: string;
  tipoMime: string;
};

@Injectable()
export class VisualizarContratoService {
  constructor(
    private readonly contratoRepository: ContratoRepositoryContract,
    private readonly storageService: StorageServiceContract,
  ) {}

  async execute(contratoId: number): Promise<DocumentoContrato> {
    const contrato = await this.contratoRepository.buscar(contratoId);

    if (!contrato) {
      throw new ContratoNaoEncontradoException(contratoId);
    }

    return {
      stream: await this.storageService.abrirStream(contrato.caminhoArquivo),
      nomeArquivo: basename(contrato.caminhoArquivo),
      tipoMime: this.obterTipoMime(contrato.caminhoArquivo),
    };
  }

  private obterTipoMime(chave: string): string {
    const tiposMime: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx':
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    return (
      tiposMime[extname(chave).toLowerCase()] ?? 'application/octet-stream'
    );
  }
}
