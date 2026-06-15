import { Module } from '@nestjs/common';
import { EnviarPinEmailController } from './controllers/enivar-pin-email.controller';
import { ConfirmarPinController } from './controllers/confirmar-pin.controller';
import { LoginController } from './controllers/login.controller';
import { RefreshTokenController } from './controllers/refresh-token.controller';

@Module({
  controllers: [EnviarPinEmailController, ConfirmarPinController, LoginController, RefreshTokenController, ],
  providers: [],
  exports: [],
  imports: [],
})
export class AutenticacaoModule {}
