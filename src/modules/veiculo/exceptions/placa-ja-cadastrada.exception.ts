import { ConflictException } from '@nestjs/common';

export class PlacaJaCadastradaException extends ConflictException {
  constructor(placa: string) {
    super(`A placa ${placa} já está cadastrada`);
  }
}
