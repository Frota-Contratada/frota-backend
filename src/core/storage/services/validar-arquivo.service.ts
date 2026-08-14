import {
  BadRequestException,
  Injectable,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MimeTypeEnum } from '../enums/mime-type.enum';
import { ArquivoRecebidoInterface } from '../interfaces/arquivo-recebido.interface';

@Injectable()
export class ValidarArquivoService {
  private readonly tamanhoMaximoBytes: number;

  constructor(configService: ConfigService) {
    this.tamanhoMaximoBytes = Number(
      configService.getOrThrow<string>('STORAGE_TAMANHO_MAXIMO_BYTES'),
    );
  }

  validar(
    arquivo: ArquivoRecebidoInterface | undefined,
    tiposPermitidos: readonly string[],
  ): asserts arquivo is ArquivoRecebidoInterface {
    if (!arquivo?.buffer?.length) {
      throw new BadRequestException('Envie um arquivo.');
    }

    if (arquivo.size > this.tamanhoMaximoBytes) {
      throw new PayloadTooLargeException(
        `O arquivo deve ter no máximo ${this.tamanhoMaximoBytes} bytes.`,
      );
    }

    if (
      !tiposPermitidos.includes(arquivo.mimetype) ||
      !this.assinaturaValida(arquivo)
    ) {
      throw new UnsupportedMediaTypeException(
        'O tipo do arquivo não é permitido ou o conteúdo é inválido.',
      );
    }
  }

  private assinaturaValida(arquivo: ArquivoRecebidoInterface): boolean {
    switch (arquivo.mimetype) {
      case MimeTypeEnum.JPEG:
        return arquivo.buffer
          .subarray(0, 3)
          .equals(Buffer.from([0xff, 0xd8, 0xff]));
      case MimeTypeEnum.PNG:
        return arquivo.buffer
          .subarray(0, 8)
          .equals(
            Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
          );
      case MimeTypeEnum.WEBP:
        return (
          arquivo.buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
          arquivo.buffer.subarray(8, 12).toString('ascii') === 'WEBP'
        );
      case MimeTypeEnum.PDF:
        return arquivo.buffer.subarray(0, 5).toString('ascii') === '%PDF-';
      case MimeTypeEnum.DOC:
        return arquivo.buffer
          .subarray(0, 8)
          .equals(
            Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]),
          );
      case MimeTypeEnum.DOCX:
        return arquivo.buffer
          .subarray(0, 4)
          .equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
      default:
        return false;
    }
  }
}
