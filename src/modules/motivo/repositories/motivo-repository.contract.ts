import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { Motivo } from '../domain/motivo';
import { TipoMotivo } from '../enums/tipo-motivo.enum';

export type BuscarMotivosFiltros = {
  nome?: string;
  tipo?: TipoMotivo;
  /**
   * Quando informado, retorna os motivos da filial somados aos globais, ou
   * seja, a lista efetivamente disponível para aquela filial.
   */
  filialId?: number;
  /** Quando `true`, restringe o resultado apenas aos motivos globais. */
  apenasGlobais?: boolean;
  /** Quando `true`, inclui também os motivos desativados. */
  incluirInativos?: boolean;
  page: number;
  limit: number;
};

export type ExistePorNomeFiltros = {
  nome: string;
  tipo: TipoMotivo;
  /**
   * `undefined` verifica somente o escopo global. Um id de filial verifica
   * o escopo da filial somado ao global, evitando nomes duplicados na lista
   * que aquela filial enxerga.
   */
  filialId?: number;
  /** Id desconsiderado na verificação. Usado na atualização. */
  ignorarId?: number;
};

export abstract class MotivoRepositoryContract {
  abstract buscar(id: number): Promise<Motivo | null>;
  abstract buscarVarios(
    filtros: BuscarMotivosFiltros,
  ): Promise<PaginatedResponseInterface<Motivo>>;
  abstract criar(motivo: Motivo): Promise<Motivo>;
  abstract atualizar(
    id: number,
    nome: string,
    tipo: TipoMotivo,
  ): Promise<Motivo>;
  abstract desativar(id: number): Promise<Motivo>;
  abstract existePorNome(filtros: ExistePorNomeFiltros): Promise<boolean>;
}
