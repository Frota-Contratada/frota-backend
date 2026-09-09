import { Module } from '@nestjs/common';
import { AuthModule } from '@core/auth/auth.module';
import { PrismaModule } from '@core/prisma/prisma.module';
import { FilialModule } from '@module/filial/filial.module';
import { AtualizarMotivoController } from './controllers/atualizar-motivo.controller';
import { BuscarMotivoController } from './controllers/buscar-motivo.controller';
import { BuscarVariosMotivosController } from './controllers/buscar-varios-motivos.controller';
import { CriarMotivoController } from './controllers/criar-motivo.controller';
import { DesativarMotivoController } from './controllers/desativar-motivo.controller';
import { MotivoRepositoryContract } from './repositories/motivo-repository.contract';
import { PrismaMotivoRepository } from './repositories/prisma-motivo.repository';
import { AtualizarMotivoService } from './services/atualizar-motivo.service';
import { BuscarMotivoService } from './services/buscar-motivo.service';
import { BuscarVariosMotivosService } from './services/buscar-varios-motivos.service';
import { CriarMotivoService } from './services/criar-motivo.service';
import { DesativarMotivoService } from './services/desativar-motivo.service';
import { ValidarMotivoDaFilialService } from './services/validar-motivo-da-filial.service';

@Module({
  imports: [PrismaModule, AuthModule, FilialModule],
  controllers: [
    CriarMotivoController,
    BuscarVariosMotivosController,
    BuscarMotivoController,
    AtualizarMotivoController,
    DesativarMotivoController,
  ],
  providers: [
    CriarMotivoService,
    BuscarVariosMotivosService,
    BuscarMotivoService,
    AtualizarMotivoService,
    DesativarMotivoService,
    ValidarMotivoDaFilialService,
    {
      provide: MotivoRepositoryContract,
      useClass: PrismaMotivoRepository,
    },
  ],
  exports: [
    MotivoRepositoryContract,
    BuscarMotivoService,
    BuscarVariosMotivosService,
  ],
})
export class MotivoModule {}
