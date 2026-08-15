import { Module } from '@nestjs/common';
import { CriarFilialController } from './controllers/criar-filial.controller';
import { BuscarFilialController } from './controllers/buscar-filial.controller';
import { BuscarVariasFiliaisController } from './controllers/buscar-varias-filiais.controller';
import { AtualizarFilialController } from './controllers/atualizar-filial.controller';
import { SubstituirAdministradoresController } from './controllers/substituir-administradores.controller';
import { CriarFilialService } from './services/criar-filial.service';
import { BuscarFilialService } from './services/buscar-filial.service';
import { BuscarVariasFiliaisService } from './services/buscar-varias-filiais.service';
import { AtualizarFilialService } from './services/atualizar-filial.service';
import { SubstituirAdministradoresService } from './services/substituir-administradores.service';
import { ValidarUsuarioNaFilialService } from './services/validar-usuario-na-filial.service';
import { FilialRepositoryContract } from './repositories/filial-repository.contract';
import { PrismaFilialRepository } from './repositories/prisma-filial.repository';
import { PrismaModule } from '@core/prisma/prisma.module';
import { UsuarioInfoModule } from '@module/usuario/info/usuario-info.module';

@Module({
  imports: [PrismaModule, UsuarioInfoModule],
  controllers: [
    CriarFilialController,
    BuscarVariasFiliaisController,
    BuscarFilialController,
    AtualizarFilialController,
    SubstituirAdministradoresController,
  ],
  providers: [
    CriarFilialService,
    BuscarVariasFiliaisService,
    BuscarFilialService,
    AtualizarFilialService,
    SubstituirAdministradoresService,
    ValidarUsuarioNaFilialService,
    {
      provide: FilialRepositoryContract,
      useClass: PrismaFilialRepository,
    },
  ],
  exports: [FilialRepositoryContract, ValidarUsuarioNaFilialService],
})
export class FilialModule {}
