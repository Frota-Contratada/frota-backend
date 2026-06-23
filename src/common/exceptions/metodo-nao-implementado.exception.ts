import { NotImplementedException } from '@nestjs/common';

export class MetodoNaoImplementadoException extends NotImplementedException {
  constructor();
  constructor(nome: string);

  constructor(nome?: string) {
    super('Método ' + nome ? nome : '' + ' não implementado');
  }
}
