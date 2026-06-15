import { Pagination } from '../types/pagination.type';

export interface BaseRepositoryInterface<T, IdType = any> {
  buscar(id: IdType): Promise<T>;
  buscarVarios(params: { pagination: Pagination; where?: any }): Promise<T[]>;
  contar(params: { pagination: Pagination; where?: any }): Promise<number>;
  atualizar(id: IdType, data: T): Promise<T>;
  deletar(id: IdType): void;
}
