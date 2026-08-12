import { Contrato } from '../domain/contrato';

export abstract class ContratoRepositoryContract {
  abstract criar(contrato: Contrato): Promise<Contrato>;
  abstract buscar(id: number): Promise<Contrato | null>;
}
