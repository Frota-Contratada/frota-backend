import { MimeTypeImagemEnum } from '../enums/mime-type-imagem.enum';

export type TiposArquivoPermitidos = Readonly<
  Record<string, readonly string[]>
>;

export const TIPOS_IMAGEM_PERMITIDOS: TiposArquivoPermitidos = {
  '.jpg': [MimeTypeImagemEnum.JPEG],
  '.jpeg': [MimeTypeImagemEnum.JPEG],
  '.png': [MimeTypeImagemEnum.PNG],
  '.webp': [MimeTypeImagemEnum.WEBP],
};
