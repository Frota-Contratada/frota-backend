import { BaseRepositoryInterface } from '@common/interfaces';
import { Autenticacao } from './autenticacao';

export interface AutenticacaoRepositoryInterface extends BaseRepositoryInterface<
  Autenticacao,
  number
> {}
