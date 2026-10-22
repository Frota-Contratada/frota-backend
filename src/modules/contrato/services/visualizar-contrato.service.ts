import { Injectable } from '@nestjs/common';
import { basename } from 'node:path';
import { Readable } from 'node:stream';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { StorageServiceContract } from '@core/storage/contracts/storage-service.contract';
import { MimeTypeService } from '@core/storage/services/mime-type.service';
import { ContratoNaoEncontradoException } from '../exceptions/contrato-nao-encontrado.exception';
import { ContratoRepositoryContract } from '../repositories/contrato-repository.contract';
import { ValidarAcessoAoContratoService } from './validar-acesso-ao-contrato.service';

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
    private readonly validarAcessoAoContrato: ValidarAcessoAoContratoService,
  ) {}

  async execute(
    contratoId: number,
    usuario: AuthenticatedUser,
  ): Promise<DocumentoContrato> {
    const contrato = await this.contratoRepository.buscar(contratoId);

    if (!contrato) {
      throw new ContratoNaoEncontradoException(contratoId);
    }

    await this.validarAcessoAoContrato.execute(contratoId, usuario);

    return {
      stream: await this.storageService.abrirStream(contrato.caminhoArquivo),
      nomeArquivo: basename(contrato.caminhoArquivo),
      tipoMime: this.mimeTypeService.mimeType(contrato.caminhoArquivo),
    };
  }
}
