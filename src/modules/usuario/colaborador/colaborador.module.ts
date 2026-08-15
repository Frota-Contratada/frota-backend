import { Module } from '@nestjs/common';
import { AuthModule } from '@core/auth/auth.module';
import { PrismaModule } from '@core/prisma/prisma.module';
import { StorageModule } from '@core/storage/storage.module';
import { CentroDeCustoModule } from '@module/centro-de-custo/centro-de-custo.module';
import { FilialModule } from '@module/filial/filial.module';
import { BuscarPerfisDoColaboradorController } from './controllers/buscar-perfis-do-colaborador.controller';
import { BuscarVariosColaboradoresController } from './controllers/buscar-varios-colaboradores.controller';
import { TornarAprovadorController } from './controllers/tornar-aprovador.controller';
import { TornarSolicitanteController } from './controllers/tornar-solicitante.controller';
import { TornarSolicitanteEmergenciaController } from './controllers/tornar-solicitante-emergencia.controller';
import { ColaboradorRepositoryContract } from './repositories/colaborador-repository.contract';
import { PrismaColaboradorRepository } from './repositories/prisma-colaborador.repository';
import { BuscarBigNumbersColaboradoresService } from './services/buscar-big-numbers-colaboradores.service';
import { BuscarPerfisDoColaboradorService } from './services/buscar-perfis-do-colaborador.service';
import { BuscarVariosColaboradoresService } from './services/buscar-varios-colaboradores.service';
import { TornarAprovadorService } from './services/tornar-aprovador.service';
import { TornarSolicitanteService } from './services/tornar-solicitante.service';
import { TornarSolicitanteEmergenciaService } from './services/tornar-solicitante-emergencia.service';

@Module({
  imports: [
    PrismaModule,
    StorageModule,
    AuthModule,
    CentroDeCustoModule,
    FilialModule,
  ],
  controllers: [
    BuscarVariosColaboradoresController,
    BuscarPerfisDoColaboradorController,
    TornarSolicitanteController,
    TornarAprovadorController,
    TornarSolicitanteEmergenciaController,
  ],
  providers: [
    BuscarVariosColaboradoresService,
    BuscarBigNumbersColaboradoresService,
    BuscarPerfisDoColaboradorService,
    TornarSolicitanteService,
    TornarAprovadorService,
    TornarSolicitanteEmergenciaService,
    {
      provide: ColaboradorRepositoryContract,
      useClass: PrismaColaboradorRepository,
    },
  ],
  exports: [ColaboradorRepositoryContract],
})
export class ColaboradorModule {}
