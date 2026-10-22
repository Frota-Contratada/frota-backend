import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { Veiculo } from '../domain/veiculo';

export interface FiltrosBuscarVeiculos {
  fornecedorId?: number;
  /** Restringe aos fornecedores vinculados à filial por contrato. */
  filial?: { empresaId: number; filialId: number };
  placa?: string;
  ativo?: boolean;
  page: number;
  limit: number;
}

export abstract class VeiculoRepositoryContract {
  abstract criar(veiculo: Veiculo): Promise<Veiculo>;
  abstract buscar(fornecedorId: number, id: number): Promise<Veiculo | null>;
  abstract buscarVarios(
    filtros: FiltrosBuscarVeiculos,
  ): Promise<PaginatedResponseInterface<Veiculo>>;
  abstract existePlaca(placa: string): Promise<boolean>;
}
