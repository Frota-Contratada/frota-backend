import { UnsupportedMediaTypeException } from '@nestjs/common';

export class TipoDeArquivoNaoSuportadoException extends UnsupportedMediaTypeException {
  constructor(tipo: string) {
    super(`O storage não suporta o tipo de arquivo ${tipo}.`);
  }
}
