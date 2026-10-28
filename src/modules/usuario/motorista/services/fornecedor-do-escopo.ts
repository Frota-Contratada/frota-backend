import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { TipoVinculo } from '@module/autenticacao/enums/tipo-vinculo.enum';
import { VinculoDoUsuarioAusenteException } from '@module/autenticacao/exceptions/vinculo-do-usuario-ausente.exception';

/**
 * Fornecedor ao qual o usuário fica restrito ao consultar e cadastrar
 * motoristas. Admin master e admin de filial não têm restrição (undefined);
 * o admin de fornecedor só enxerga o próprio fornecedor.
 */
export function fornecedorDoEscopo(
  usuario: AuthenticatedUser,
): number | undefined {
  const perfis = new Set(usuario.perfis);
  if (
    perfis.has(TipoPerfil.ADMIN_MASTER) ||
    perfis.has(TipoPerfil.ADMIN_FILIAL)
  ) {
    return undefined;
  }

  if (!usuario.fornecedorId) {
    throw new VinculoDoUsuarioAusenteException(TipoVinculo.FORNECEDOR);
  }

  return usuario.fornecedorId;
}
