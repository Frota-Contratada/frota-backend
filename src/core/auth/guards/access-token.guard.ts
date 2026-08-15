import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@common/decorators/public.decorator';
import { TokenServiceContract } from '../contracts/token-service.contract';
import { TokenDeAcessoInvalidoException } from '../exceptions/token-de-acesso-invalido.exception';
import { TokenDeAcessoNaoInformadoException } from '../exceptions/token-de-acesso-nao-informado.exception';
import { AccessTokenPayload } from '../types/access-token-payload';
import { AuthenticatedUser } from '../types/authenticated-user';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenServiceContract,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: AuthenticatedUser;
    }>();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new TokenDeAcessoNaoInformadoException();
    }

    const token = authorization.slice('Bearer '.length);
    const valido = await this.tokenService.validarAccessToken(token);

    if (!valido) {
      throw new TokenDeAcessoInvalidoException();
    }

    const payload =
      await this.tokenService.decodificar<AccessTokenPayload>(token);

    request.user = {
      id: payload.sub,
      perfis: payload.perfis,
      filialId: payload.filialId,
      fornecedorId: payload.fornecedorId,
    };

    return true;
  }
}
