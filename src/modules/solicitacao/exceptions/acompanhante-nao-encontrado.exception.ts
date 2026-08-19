import { BadRequestException } from '@nestjs/common';

export class AcompanhanteNaoEncontradoException extends BadRequestException {
  constructor(cpf: string) {
    super(
      `Nenhum colaborador com perfil de solicitante encontrado para o CPF ${cpf}`,
    );
  }
}
