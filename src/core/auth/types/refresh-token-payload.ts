import { Plataforma } from '@common/enums/plataforma.enum';

export type RefreshTokenPayload = {
  sub: number;
  plataforma: Plataforma;
};
