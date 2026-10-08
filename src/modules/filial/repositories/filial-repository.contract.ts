import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { Filial } from '../domain/filial';
import { Endereco } from '../domain/endereco';

export abstract class FilialRepositoryContract {
  abstract buscar(empresaId: number, id: number): Promise<Filial | null>;
  abstract buscarVarios(filtros: {
    nome?: string;
    cnpj?: string;
    /** Busca pelo termo na cidade OU no bairro do endereço da filial. */
    endereco?: string;
    page: number;
    limit: number;
  }): Promise<PaginatedResponseInterface<Filial>>;
  abstract criar(filial: Filial): Promise<Filial>;
  abstract atualizar(
    empresaId: number,
    id: number,
    nome: string,
    endereco: Endereco,
  ): Promise<Filial>;
  abstract substituirAdministradores(
    empresaId: number,
    filialId: number,
    administradorIds: number[],
  ): Promise<void>;
  abstract existePorCnpj(cnpj: string): Promise<boolean>;
  abstract existeUsuarioNaFilialComPerfil(
    usuarioId: number,
    empresaId: number,
    filialId: number,
    tipoPerfil: TipoPerfil,
  ): Promise<boolean>;
}
