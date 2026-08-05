import { Fornecedor } from '../domain/fornecedor';

export type FiltrosFornecedor = {
  cnpjCpf?: string;
  nome?: string;
};

export abstract class FornecedorRepositoryContract {
  abstract buscar(id: number): Promise<Fornecedor | null>;
  abstract buscarVarios(filtros: FiltrosFornecedor): Promise<Fornecedor[]>;
  abstract criar(fornecedor: Fornecedor): Promise<Fornecedor>;
  abstract existePorNomeNaFilial(nome: string, filialId: number): Promise<boolean>;
  abstract existePorCnpjCpf(cnpjCpf: string): Promise<boolean>;
}
