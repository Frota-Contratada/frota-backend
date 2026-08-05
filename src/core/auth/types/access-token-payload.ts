import { Plataforma } from '@common/enums/plataforma.enum';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';

export type AccessTokenPayload = {
  sub: number;
  email: string;
  plataforma: Plataforma;
  perfis: TipoPerfil[];
};
