import { Module } from '@nestjs/common';
import { CriarFilialController } from './controllers/criar-filial.controller';
import { BuscarFilialController } from './controllers/buscar-filial.controller';
import { AtualizarFilialController } from './controllers/atualizar-filial.controller';
import { SubstituirAdministradoresController } from './controllers/substituir-administradores.controller';
import { CriarFilialService } from './services/criar-filial.service';
import { BuscarFilialService } from './services/buscar-filial.service';
import { AtualizarFilialService } from './services/atualizar-filial.service';
import { SubstituirAdministradoresService } from './services/substituir-administradores.service';
import { FilialRepositoryContract } from './repositories/filial-repository.contract';
import { PrismaFilialRepository } from './repositories/prisma-filial.repository';
import { PrismaModule } from '@core/prisma/prisma.module';
import { UsuarioInfoModule } from '@module/usuario/info/usuario-info.module';

@Module({
  imports: [PrismaModule, UsuarioInfoModule],
  controllers: [
    CriarFilialController,
    BuscarFilialController,
    AtualizarFilialController,
    SubstituirAdministradoresController,
  ],
  providers: [
    CriarFilialService,
    BuscarFilialService,
    AtualizarFilialService,
    SubstituirAdministradoresService,
    {
      provide: FilialRepositoryContract,
      useClass: PrismaFilialRepository,
    },
  ],
  exports: [FilialRepositoryContract],
})
export class FilialModule {}
