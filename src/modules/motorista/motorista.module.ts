import { Module } from '@nestjs/common';
import { AuthModule } from '@core/auth/auth.module';
import { PrismaModule } from '@core/prisma/prisma.module';
import { StorageModule } from '@core/storage/storage.module';
import { MotoristaController } from './controllers/motorista.controller';
import { BuscarCorridaService } from './services/buscar-corrida.service';
import { BuscarPerfilService } from './services/buscar-perfil.service';
import { BuscarViagensService } from './services/buscar-viagens.service';
import { IniciarCorridaService } from './services/iniciar-corrida.service';
import { MotoristaCorridaRepositoryContract } from './repositories/motorista-corrida-repository.contract';
import { PrismaMotoristaCorridaRepository } from './repositories/prisma-motorista-corrida.repository';
import { TrackingModule } from '@module/tracking/tracking.module';

@Module({
  imports: [PrismaModule, AuthModule, StorageModule, TrackingModule],
  controllers: [MotoristaController],
  providers: [
    BuscarCorridaService,
    BuscarPerfilService,
    BuscarViagensService,
    IniciarCorridaService,
    {
      provide: MotoristaCorridaRepositoryContract,
      useClass: PrismaMotoristaCorridaRepository,
    },
  ],
})
export class MotoristaOperacionalModule {}
