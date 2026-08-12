import {
  BadRequestException,
  Injectable,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { extname } from 'node:path';
import { TAMANHO_MAXIMO_ARQUIVO_PADRAO_BYTES } from '../constants/storage.constants';
import type { TiposArquivoPermitidos } from '../constants/tipos-imagem-permitidos.constant';
import { MimeTypeImagemEnum } from '../enums/mime-type-imagem.enum';
import { ArquivoRecebidoInterface } from '../interfaces/arquivo-recebido.interface';

@Injectable()
export class ValidarArquivoService {
  private readonly tamanhoMaximoBytes: number;

  constructor(configService: ConfigService) {
    const tamanhoConfiguradoBytes = Number(
      configService.get<string>('STORAGE_TAMANHO_MAXIMO_BYTES') ??
        TAMANHO_MAXIMO_ARQUIVO_PADRAO_BYTES,
    );

    this.tamanhoMaximoBytes =
      Number.isFinite(tamanhoConfiguradoBytes) && tamanhoConfiguradoBytes > 0
        ? tamanhoConfiguradoBytes
        : TAMANHO_MAXIMO_ARQUIVO_PADRAO_BYTES;
  }

  validar(
    arquivo: ArquivoRecebidoInterface | undefined,
    tiposPermitidos?: TiposArquivoPermitidos,
  ): asserts arquivo is ArquivoRecebidoInterface {
    if (!arquivo?.buffer?.length) {
      throw new BadRequestException('Envie um arquivo.');
    }

    if (arquivo.size > this.tamanhoMaximoBytes) {
      throw new PayloadTooLargeException(
        `O arquivo deve ter no máximo ${this.tamanhoMaximoBytes} bytes.`,
      );
    }

    if (tiposPermitidos && !this.tipoValido(arquivo, tiposPermitidos)) {
      throw new UnsupportedMediaTypeException(
        'O tipo do arquivo não é permitido ou o conteúdo é inválido.',
      );
    }
  }

  private tipoValido(
    arquivo: ArquivoRecebidoInterface,
    tiposPermitidos: TiposArquivoPermitidos,
  ): boolean {
    const extensao = extname(arquivo.originalname).toLowerCase();
    const mimetypesPermitidos = tiposPermitidos[extensao];

    if (!mimetypesPermitidos?.includes(arquivo.mimetype)) {
      return false;
    }

    return this.assinaturaValida(arquivo.buffer, arquivo.mimetype);
  }

  private assinaturaValida(buffer: Buffer, mimetype: string): boolean {
    const mimeTypeImagem = mimetype as MimeTypeImagemEnum;

    if (mimeTypeImagem === MimeTypeImagemEnum.JPEG) {
      return buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
    }

    if (mimeTypeImagem === MimeTypeImagemEnum.PNG) {
      return buffer
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    }

    if (mimeTypeImagem === MimeTypeImagemEnum.WEBP) {
      return (
        buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
        buffer.subarray(8, 12).toString('ascii') === 'WEBP'
      );
    }

    return true;
  }
}
