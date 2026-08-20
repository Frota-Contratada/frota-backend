import { Module } from '@nestjs/common';
import { AuthModule } from '@core/auth/auth.module';
import { PrismaModule } from '@core/prisma/prisma.module';
import { StorageModule } from '@core/storage/storage.module';
import { MotoristaController } from './controllers/motorista.controller';
import { BuscarCorridaService } from './services/buscar-corrida.service';
import { BuscarPerfilService } from './services/buscar-perfil.service';
import { BuscarViagensService } from './services/buscar-viagens.service';
import { IniciarCorridaService } from './services/iniciar-corrida.service';
import { RecusarCorridaService } from './services/recusar-corrida.service';
import { MotoristaCorridaRepositoryContract } from './repositories/motorista-corrida-repository.contract';
import { PrismaMotoristaCorridaRepository } from './repositories/prisma-motorista-corrida.repository';

@Module({
  imports: [PrismaModule, AuthModule, StorageModule],
  controllers: [MotoristaController],
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
