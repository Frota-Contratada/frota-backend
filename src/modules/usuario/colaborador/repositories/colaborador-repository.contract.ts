import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { Colaborador } from '../domain/colaborador';
import { ColaboradorBigNumbers } from '../domain/types/colaborador-big-numbers.type';
import { ColaboradorSummary } from '../domain/types/colaborador-summary.type';

export abstract class ColaboradorRepositoryContract {
  abstract buscar(id: number): Promise<Colaborador | null>;
  abstract buscarVarios(filtros: {
    nome?: string;
    cpf?: string;
    filialId?: number;
    page: number;
    limit: number;
  }): Promise<PaginatedResponseInterface<ColaboradorSummary>>;
  abstract buscarBigNumbers(filtros: {
    nome?: string;
    cpf?: string;
    filialId?: number;
  }): Promise<ColaboradorBigNumbers>;
  abstract atualizarCentroCusto(
    id: number,
    centroCustoId: number,
  ): Promise<void>;
  abstract concederPerfil(
    usuarioId: number,
    tipoPerfil: TipoPerfil,
  ): Promise<void>;
}
