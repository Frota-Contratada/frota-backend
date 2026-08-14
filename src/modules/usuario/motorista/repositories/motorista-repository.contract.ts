import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { Motorista } from '../domain/motorista';

export abstract class MotoristaRepositoryContract {
  abstract buscar(id: number): Promise<Motorista | null>;
  abstract buscarVarios(filtros: {
    nome?: string;
    cpf?: string;
    page: number;
    limit: number;
  }): Promise<PaginatedResponseInterface<Motorista>>;
  abstract criar(motorista: Motorista): Promise<Motorista>;
}
