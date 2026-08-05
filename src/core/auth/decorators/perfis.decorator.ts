import { SetMetadata } from '@nestjs/common';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';

export const PERFIS_KEY = 'perfis';

export const Perfis = (...perfis: TipoPerfil[]) =>
  SetMetadata(PERFIS_KEY, perfis);
