import { Module } from '@nestjs/common';
import { AuthModule } from '@core/auth/auth.module';
import { PrismaModule } from '@core/prisma/prisma.module';
import { StorageModule } from '@core/storage/storage.module';
import { AtualizarFotoPerfilController } from './controllers/atualizar-foto-perfil.controller';
import { UsuarioAtualController } from './controllers/usuario-atual.controller';
import { PrismaUsuarioRepository } from './repositories/prisma-usuario.repository';
import { UsuarioRepositoryContract } from './repositories/usuario-repository.contract';
import { AtualizarFotoPerfilService } from './services/atualizar-foto-perfil.service';
import { UsuarioAtualService } from './services/usuario-atual.service';

@Module({
  imports: [PrismaModule, AuthModule, StorageModule],
  controllers: [UsuarioAtualController, AtualizarFotoPerfilController],
  providers: [
    UsuarioAtualService,
    AtualizarFotoPerfilService,
    { provide: UsuarioRepositoryContract, useClass: PrismaUsuarioRepository },
  ],
  exports: [UsuarioRepositoryContract],
})
export class UsuarioInfoModule {}
