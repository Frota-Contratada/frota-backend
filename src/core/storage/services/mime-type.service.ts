import { Injectable } from '@nestjs/common';
import { extname } from 'node:path';
import { MimeTypeEnum } from '../enums/mime-type.enum';
import { TipoDeArquivoNaoSuportadoException } from '../exceptions/tipo-de-arquivo-nao-suportado.exception';

@Injectable()
export class MimeTypeService {
  extensao(mimeType: string): string {
    switch (mimeType) {
      case MimeTypeEnum.JPEG:
        return '.jpg';
      case MimeTypeEnum.PNG:
        return '.png';
      case MimeTypeEnum.WEBP:
        return '.webp';
      case MimeTypeEnum.PDF:
        return '.pdf';
      case MimeTypeEnum.DOC:
        return '.doc';
      case MimeTypeEnum.DOCX:
        return '.docx';
      default:
        throw new TipoDeArquivoNaoSuportadoException(mimeType);
    }
  }

  mimeType(chave: string): MimeTypeEnum {
    const extensao = extname(chave).toLowerCase();

    switch (extensao) {
      case '.jpg':
      case '.jpeg':
        return MimeTypeEnum.JPEG;
      case '.png':
        return MimeTypeEnum.PNG;
      case '.webp':
        return MimeTypeEnum.WEBP;
      case '.pdf':
        return MimeTypeEnum.PDF;
      case '.doc':
        return MimeTypeEnum.DOC;
      case '.docx':
        return MimeTypeEnum.DOCX;
      default:
        throw new TipoDeArquivoNaoSuportadoException(extensao);
    }
  }
}
