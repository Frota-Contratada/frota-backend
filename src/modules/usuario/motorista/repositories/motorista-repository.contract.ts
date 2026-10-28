import { DirecaoOrdenacao } from '@common/enums/direcao-ordenacao.enum';
import { CampoOrdenacaoMotorista } from '../enums/ordenacao-motorista.enum';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { Motorista } from '../domain/motorista';

export abstract class MotoristaRepositoryContract {
  abstract buscar(id: number): Promise<Motorista | null>;
  abstract buscarVarios(filtros: {
    nome?: string;
    cpf?: string;
    fornecedorId?: number;
    ordenarPor?: CampoOrdenacaoMotorista;
    direcao?: DirecaoOrdenacao;
    page: number;
    limit: number;
  }): Promise<PaginatedResponseInterface<Motorista>>;
  abstract criar(motorista: Motorista): Promise<Motorista>;
}
