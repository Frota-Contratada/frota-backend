import { DateTime } from 'luxon';
import { MotoristaCorrida, MotoristaPerfil } from '../domain/motorista-corrida';

export abstract class MotoristaCorridaRepositoryContract {
  abstract buscarViagens(
    motoristaId: number,
    inicio: DateTime,
    fim: DateTime,
  ): Promise<MotoristaCorrida[]>;

  abstract buscar(
    corridaId: number,
    motoristaId: number,
  ): Promise<MotoristaCorrida | null>;

  abstract iniciar(
    corridaId: number,
    motoristaId: number,
  ): Promise<MotoristaCorrida>;

  abstract recusar(
    corridaId: number,
    motoristaId: number,
    motivo: string,
  ): Promise<MotoristaCorrida>;

  abstract buscarPerfil(motoristaId: number): Promise<MotoristaPerfil | null>;
}
