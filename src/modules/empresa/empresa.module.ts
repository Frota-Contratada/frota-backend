import { Module } from '@nestjs/common';
import { PrismaModule } from '@core/prisma/prisma.module';
import { EmpresaController } from './empresa.controller';

@Module({
  imports: [PrismaModule],
  controllers: [EmpresaController],
})
export class EmpresaModule {}
