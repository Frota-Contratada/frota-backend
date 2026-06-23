import { Module } from '@nestjs/common';
import { EnviarPinEmailController } from './controllers/enivar-pin-email.controller';
import { ConfirmarPinController } from './controllers/confirmar-pin.controller';
import { LoginController } from './controllers/login.controller';
import { RefreshTokenController } from './controllers/refresh-token.controller';
import { AuthModule } from '@core/auth/auth.module';
import { LoginService } from './services/login.service';
import { AutenticacaoRepositoryContract } from './repositories/autenticacao-repository.contract';
import { PrismaAutenticacaoRepository } from './repositories/prisma-autenticacao.repository';
import { PrismaModule } from '@core/prisma/prisma.module';
import { RefreshTokenService } from './services/refresh-token.service';
import { PinRepositoryContract } from './repositories/pin-repository.contract';
import { PrismaPinRepository } from './repositories/prisma-pin.repository';
import { EnviarPinEmailService } from './services/enivar-pin-email.service';

@Module({
  controllers: [
    EnviarPinEmailController,
    ConfirmarPinController,
    LoginController,
    RefreshTokenController,
  ],
  providers: [
    LoginService,
    RefreshTokenService,
    EnviarPinEmailService,
    {
      provide: AutenticacaoRepositoryContract,
      useClass: PrismaAutenticacaoRepository,
    },
    {
      provide: PinRepositoryContract,
      useClass: PrismaPinRepository,
    },
  ],
  imports: [AuthModule, PrismaModule],
})
export class AutenticacaoModule {}
