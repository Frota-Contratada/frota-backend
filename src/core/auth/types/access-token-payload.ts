import { Plataforma } from '@common/enums/plataforma.enum';

export type AccessTokenPayload = {
  sub: number;
  email: string;
  plataforma: Plataforma;
};
