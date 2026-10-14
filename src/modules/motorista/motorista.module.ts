import { Module } from '@nestjs/common';
import { AuthModule } from '@core/auth/auth.module';
import { PrismaModule } from '@core/prisma/prisma.module';
import { StorageModule } from '@core/storage/storage.module';
import { BuscarCorridaController } from './controllers/buscar-corrida.controller';
import { BuscarPerfilController } from './controllers/buscar-perfil.controller';
import { BuscarViagensController } from './controllers/buscar-viagens.controller';
import { IniciarCorridaController } from './controllers/iniciar-corrida.controller';
import { RecusarCorridaController } from './controllers/recusar-corrida.controller';
import { BuscarCorridaService } from './services/buscar-corrida.service';
import { BuscarPerfilService } from './services/buscar-perfil.service';
import { BuscarViagensService } from './services/buscar-viagens.service';
import { IniciarCorridaService } from './services/iniciar-corrida.service';
import { RecusarCorridaService } from './services/recusar-corrida.service';
import { MotoristaCorridaRepositoryContract } from './repositories/motorista-corrida-repository.contract';
import { PrismaMotoristaCorridaRepository } from './repositories/prisma-motorista-corrida.repository';
import { TrackingModule } from '@module/tracking/tracking.module';
import { NotificacaoModule } from '@module/notificacao/notificacao.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    StorageModule,
    TrackingModule,
    NotificacaoModule,
  ],
  controllers: [
    BuscarViagensController,
    BuscarCorridaController,
    IniciarCorridaController,
    RecusarCorridaController,
    BuscarPerfilController,
  ],
  providers: [
    BuscarCorridaService,
    BuscarPerfilService,
    BuscarViagensService,
    IniciarCorridaService,
    RecusarCorridaService,
    {
      provide: MotoristaCorridaRepositoryContract,
      useClass: PrismaMotoristaCorridaRepository,
    },
  ],
})
export class MotoristaOperacionalModule {}
