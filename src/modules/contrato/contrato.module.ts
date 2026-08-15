import { Module } from '@nestjs/common';
import { StorageModule } from '@core/storage/storage.module';
import { PrismaModule } from '@core/prisma/prisma.module';
import { ContratoRepositoryContract } from './repositories/contrato-repository.contract';
import { PrismaContratoRepository } from './repositories/prisma-contrato.repository';
import { CriarContratoController } from './controllers/criar-contrato.controller';
import { BuscarVariosContratosController } from './controllers/buscar-varios-contratos.controller';
import { VisualizarContratoController } from './controllers/visualizar-contrato.controller';
import { CriarContratoService } from './services/criar-contrato.service';
import { BuscarVariosContratosService } from './services/buscar-varios-contratos.service';
import { BuscarBigNumbersContratosService } from './services/buscar-big-numbers-contratos.service';
import { VisualizarContratoService } from './services/visualizar-contrato.service';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [
    CriarContratoController,
    BuscarVariosContratosController,
    VisualizarContratoController,
  ],
  providers: [
    CriarContratoService,
    BuscarVariosContratosService,
    BuscarBigNumbersContratosService,
    VisualizarContratoService,
    {
      provide: ContratoRepositoryContract,
      useClass: PrismaContratoRepository,
    },
  ],
})
export class ContratoModule {}
