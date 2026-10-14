import { Module } from '@nestjs/common';
import { PrismaModule } from '@core/prisma/prisma.module';
import { BuscarEmpresaController } from './controllers/buscar-empresa.controller';
import { CriarEmpresaController } from './controllers/criar-empresa.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CriarEmpresaController, BuscarEmpresaController],
})
export class EmpresaModule {}
