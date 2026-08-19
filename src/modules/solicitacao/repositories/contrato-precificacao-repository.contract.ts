import { DateTime } from 'luxon';
import { ContratoPrecificacao } from '../domain/contrato-precificacao';

export abstract class ContratoPrecificacaoRepositoryContract {
  abstract buscarCandidatos(
    filialId: number,
    tipoCorridaId: number,
    data: DateTime,
  ): Promise<ContratoPrecificacao[]>;
}
