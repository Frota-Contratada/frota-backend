import { Filial } from '../domain/filial';
import { Endereco } from '../domain/endereco';

export type FiltrosFilial = {
  cnpj?: string;
  nome?: string;
};

export abstract class FilialRepositoryContract {
  abstract buscar(id: number): Promise<Filial | null>;
  abstract buscarVarios(filtros: FiltrosFilial): Promise<Filial[]>;
  abstract criar(filial: Filial): Promise<Filial>;
  abstract atualizar(
    id: number,
    nome: string,
    endereco: Endereco,
  ): Promise<Filial>;
  abstract substituirAdministradores(
    filialId: number,
    administradorIds: number[],
  ): Promise<void>;
  abstract existePorNome(nome: string): Promise<boolean>;
  abstract existePorCnpj(cnpj: string): Promise<boolean>;
}
