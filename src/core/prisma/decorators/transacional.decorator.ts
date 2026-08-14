import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { TransacaoInterceptor } from '../interceptors/transacao.interceptor';

export function Transacional() {
  return applyDecorators(UseInterceptors(TransacaoInterceptor));
}
