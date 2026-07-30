import { Plataforma } from '@common/enums/plataforma.enum';

export abstract class TokenCacheServiceContract {
  abstract salvar(
    usuarioId: number,
    plataforma: Plataforma,
    refreshToken: string,
    validade: number,
  ): Promise<void>;
  abstract encontrarPorUsuarioIdPlataforma(
    usuarioId: number,
    plataforma: Plataforma,
  ): Promise<string | null>;
  abstract deletarPorUsuarioIdPlataforma(
    usuarioId: number,
    plataforma: Plataforma,
  ): Promise<void>;
}
