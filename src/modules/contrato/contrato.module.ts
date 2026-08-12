import { Module } from '@nestjs/common';
import { StorageModule } from '@core/storage/storage.module';
import { PrismaModule } from '@core/prisma/prisma.module';
import { ContratoRepositoryContract } from './repositories/contrato-repository.contract';
import { PrismaContratoRepository } from './repositories/prisma-contrato.repository';
import { CriarContratoController } from './controllers/criar-contrato.controller';
import { VisualizarContratoController } from './controllers/visualizar-contrato.controller';
import { CriarContratoService } from './services/criar-contrato.service';
import { VisualizarContratoService } from './services/visualizar-contrato.service';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [CriarContratoController, VisualizarContratoController],
  providers: [
    CriarContratoService,
    VisualizarContratoService,
    {
      provide: ContratoRepositoryContract,
      useClass: PrismaContratoRepository,
    },
  ],
})
export class ContratoModule {}
