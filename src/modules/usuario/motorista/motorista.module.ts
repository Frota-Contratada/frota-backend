import { Module } from '@nestjs/common';
import { CriarMotoristaController } from './controllers/criar-motorista.controller';
import { BuscarMotoristaController } from './controllers/buscar-motorista.controller';
import { CriarMotoristaService } from './services/criar-motorista.service';
import { BuscarMotoristaService } from './services/buscar-motorista.service';
import { BuscarVariosMotoristasService } from './services/buscar-varios-motoristas.service';
import { MotoristaRepositoryContract } from './repositories/motorista-repository.contract';
import { PrismaMotoristaRepository } from './repositories/prisma-motorista.repository';
import { FornecedorModule } from '@module/fornecedor/fornecedor.module';
import { UsuarioInfoModule } from '@module/usuario/info/usuario-info.module';
import { PrismaModule } from '@core/prisma/prisma.module';
import { AuthModule } from '@core/auth/auth.module';
import { UsuarioAtualController } from '../info/controllers/usuario-atual.controller';
import { UsuarioAtualService } from '../info/services/usuario-atual.service';

@Module({
  controllers: [
    CriarMotoristaController,
    BuscarMotoristaController,
    UsuarioAtualController,
  ],
  providers: [
    CriarMotoristaService,
    BuscarVariosMotoristasService,
    BuscarMotoristaService,
    UsuarioAtualService,
    {
      provide: MotoristaRepositoryContract,
      useClass: PrismaMotoristaRepository,
    },
  ],
  imports: [PrismaModule, FornecedorModule, UsuarioInfoModule, AuthModule],
})
export class MotoristaModule {}
