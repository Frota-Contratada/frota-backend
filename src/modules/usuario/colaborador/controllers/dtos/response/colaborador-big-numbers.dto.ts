import { ColaboradorBigNumbers } from '../../../domain/types/colaborador-big-numbers.type';

export class ColaboradorBigNumbersDto {
  administradoresDeFilial: number;
  aprovadores: number;
  solicitantesDeEmergencia: number;

  constructor(bigNumbers: ColaboradorBigNumbers) {
    this.administradoresDeFilial = bigNumbers.administradoresDeFilial;
    this.aprovadores = bigNumbers.aprovadores;
    this.solicitantesDeEmergencia = bigNumbers.solicitantesDeEmergencia;
  }
}
