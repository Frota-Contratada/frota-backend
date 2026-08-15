import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';

export type AuthenticatedUser = {
  id: number;
  perfis: TipoPerfil[];
  filialId?: number;
  fornecedorId?: number;
};
