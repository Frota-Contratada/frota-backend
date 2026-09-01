import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuthenticatedUser } from '@core/auth/types/authenticated-user';

@Injectable()
export class LogRequisicaoMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const inicio = process.hrtime.bigint();
    const { method, originalUrl } = request;
    response.on('finish', () => {
      const duracaoMs = Number(process.hrtime.bigint() - inicio) / 1_000_000;
      const usuario = (request as Request & { user?: AuthenticatedUser }).user;
      const identificacao = usuario ? `usuario=${usuario.id}` : 'anonimo';
      const tamanho = response.get('content-length');

      const mensagem =
        `${method} ${originalUrl} ${response.statusCode} ` +
        `${duracaoMs.toFixed(1)}ms ${identificacao}` +
        (tamanho ? ` ${tamanho}b` : '');

      if (response.statusCode >= 500) {
        this.logger.error(mensagem);
        return;
      }

      if (response.statusCode >= 400) {
        this.logger.warn(mensagem);
        return;
      }

      this.logger.log(mensagem);
    });

    next();
  }
}
