import { Motorista } from '../domain/motorista';

export type FiltrosMotorista = {
  nome?: string;
  cpf?: string;
};

export abstract class MotoristaRepositoryContract {
  abstract buscar(id: number): Promise<Motorista | null>;
  abstract buscarVarios(filtros: FiltrosMotorista): Promise<Motorista[]>;
  abstract criar(motorista: Motorista): Promise<Motorista>;
}
