import { Injectable } from '@nestjs/common';
import { basename } from 'node:path';
import { Readable } from 'node:stream';
import { StorageServiceContract } from '@core/storage/contracts/storage-service.contract';
import { MimeTypeService } from '@core/storage/services/mime-type.service';
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
    private readonly mimeTypeService: MimeTypeService,
  ) {}

  async execute(contratoId: number): Promise<DocumentoContrato> {
    const contrato = await this.contratoRepository.buscar(contratoId);

    if (!contrato) {
      throw new ContratoNaoEncontradoException(contratoId);
    }

    return {
      stream: await this.storageService.abrirStream(contrato.caminhoArquivo),
      nomeArquivo: basename(contrato.caminhoArquivo),
      tipoMime: this.mimeTypeService.mimeType(contrato.caminhoArquivo),
    };
  }
}
