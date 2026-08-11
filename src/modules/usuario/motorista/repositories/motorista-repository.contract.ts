import { Motorista } from '../domain/motorista';

export abstract class MotoristaRepositoryContract {
  abstract buscar(id: number): Promise<Motorista | null>;
  abstract buscarVarios(filtros: {
    nome?: string;
    cpf?: string;
  }): Promise<Motorista[]>;
  abstract criar(motorista: Motorista): Promise<Motorista>;
}
