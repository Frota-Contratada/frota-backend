import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { Fornecedor } from '../domain/fornecedor';
import { FornecedorBigNumbers } from '../domain/types/fornecedor-big-numbers.type';
import { FornecedorSummary } from '../domain/types/fornecedor-summary.type';

export abstract class FornecedorRepositoryContract {
  abstract buscar(id: number): Promise<Fornecedor | null>;
  abstract buscarVarios(filtros: {
    nome?: string;
    cnpjCpf?: string;
    filialId?: number;
    page: number;
    limit: number;
  }): Promise<PaginatedResponseInterface<FornecedorSummary>>;
  abstract buscarBigNumbers(filtros: {
    nome?: string;
    cnpjCpf?: string;
    filialId?: number;
  }): Promise<FornecedorBigNumbers>;
  abstract criar(fornecedor: Fornecedor): Promise<Fornecedor>;
  abstract atualizarFoto(
    id: number,
    caminhoArquivo: string,
  ): Promise<Fornecedor>;
  abstract existePorNomeNaFilial(
    nome: string,
    filialId: number,
  ): Promise<boolean>;
  abstract existePorCnpjCpf(cnpjCpf: string): Promise<boolean>;
}
