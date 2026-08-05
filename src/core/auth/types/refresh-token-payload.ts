import { Plataforma } from '@common/enums/plataforma.enum';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';

export type RefreshTokenPayload = {
  sub: number;
  plataforma: Plataforma;
  perfis: TipoPerfil[];
};
