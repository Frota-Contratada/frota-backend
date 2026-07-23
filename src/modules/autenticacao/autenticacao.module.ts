import { Module } from '@nestjs/common';
import { EnviarPinEmailController } from './controllers/enivar-pin-email.controller';
import { ConfirmarPinController } from './controllers/confirmar-pin.controller';
import { LoginController } from './controllers/login.controller';
import { RefreshTokenController } from './controllers/refresh-token.controller';
import { AuthModule } from '@core/auth/auth.module';
import { LoginService } from './services/login.service';
import { AutenticacaoRepositoryContract } from './repositories/autenticacao/autenticacao-repository.contract';
import { PrismaAutenticacaoRepository } from './repositories/autenticacao/prisma-autenticacao.repository';
import { PrismaModule } from '@core/prisma/prisma.module';
import { RefreshTokenService } from './services/refresh-token.service';
import { PinRepositoryContract } from './repositories/pin/pin-repository.contract';
import { PrismaPinRepository } from './repositories/pin/prisma-pin.repository';
import { EnviarPinEmailService } from './services/enivar-pin-email.service';
import { SignUpController } from './controllers/sign-up.controller';
import { SignUpService } from './services/sign-up.service';
import { ConfirmarPinService } from './services/confirmar-pin.service';
import { RedefinirSenhaController } from './controllers/redefinir-senha.controller';
import { RedefinirSenhaService } from './services/redefinir-senha.service';
import { VerificarPrimeiroAcessoController } from './controllers/verificar-primeiro-acesso.controller';
import { VerificarPrimeiroAcessoService } from './services/verificar-primeiro-acesso.service';
import { EmailModule } from '@core/email/email.module';

@Module({
  controllers: [
    EnviarPinEmailController,
    ConfirmarPinController,
    LoginController,
    RefreshTokenController,
    SignUpController,
    RedefinirSenhaController,
    VerificarPrimeiroAcessoController
  ],
  providers: [
    LoginService,
    RefreshTokenService,
    EnviarPinEmailService,
    SignUpService,
    ConfirmarPinService,
    RedefinirSenhaService,
    VerificarPrimeiroAcessoService,
    {
      provide: AutenticacaoRepositoryContract,
      useClass: PrismaAutenticacaoRepository,
    },
    {
      provide: PinRepositoryContract,
      useClass: PrismaPinRepository,
    },
  ],
  imports: [AuthModule, PrismaModule, EmailModule],
})
export class AutenticacaoModule {}
