import { Module } from '@nestjs/common';
import { UsuarioRepositoryContract } from './repositories/usuario-repository.contract';
import { PrismaUsuarioRepository } from './repositories/prisma-usuario.repository';
import { PrismaModule } from '@core/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    { provide: UsuarioRepositoryContract, useClass: PrismaUsuarioRepository },
  ],
  exports: [UsuarioRepositoryContract],
})
export class UsuarioInfoModule {}
