import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedUser } from '../types/authenticated-user';
import { PERFIS_KEY } from '../decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { PerfilSemPermissaoException } from '../exceptions/perfil-sem-permissao.exception';
import { UsuarioNaoAutenticadoException } from '../exceptions/usuario-nao-autenticado.exception';

@Injectable()
export class PerfilGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const perfisPermitidos = this.reflector.getAllAndOverride<TipoPerfil[]>(
      PERFIS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (perfisPermitidos === undefined) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      user?: AuthenticatedUser;
    }>();
    const usuario = request.user;

    if (!usuario) {
      throw new UsuarioNaoAutenticadoException();
    }

    const possuiPerfil = usuario.perfis.some((perfil) =>
      perfisPermitidos.includes(perfil),
    );

    if (!possuiPerfil) {
      throw new PerfilSemPermissaoException();
    }

    return true;
  }
}
