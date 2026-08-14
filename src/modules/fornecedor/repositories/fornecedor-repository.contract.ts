import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { Fornecedor } from '../domain/fornecedor';

export abstract class FornecedorRepositoryContract {
  abstract buscar(id: number): Promise<Fornecedor | null>;
  abstract buscarVarios(filtros: {
    nome?: string;
    cnpjCpf?: string;
    page: number;
    limit: number;
  }): Promise<PaginatedResponseInterface<Fornecedor>>;
  abstract criar(fornecedor: Fornecedor): Promise<Fornecedor>;
  abstract existePorNomeNaFilial(
    nome: string,
    filialId: number,
  ): Promise<boolean>;
  abstract existePorCnpjCpf(cnpjCpf: string): Promise<boolean>;
}
