import { Module } from '@nestjs/common';
import { AuthModule } from '@core/auth/auth.module';
import { PrismaModule } from '@core/prisma/prisma.module';
import { BuscarVariosCentrosCustoController } from './controllers/buscar-varios-centros-custo.controller';
import { CentroCustoRepositoryContract } from './repositories/centro-custo-repository.contract';
import { PrismaCentroCustoRepository } from './repositories/prisma-centro-custo.repository';
import { BuscarVariosCentrosCustoService } from './services/buscar-varios-centros-custo.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [BuscarVariosCentrosCustoController],
  providers: [
    BuscarVariosCentrosCustoService,
    {
      provide: CentroCustoRepositoryContract,
      useClass: PrismaCentroCustoRepository,
    },
  ],
  exports: [CentroCustoRepositoryContract, BuscarVariosCentrosCustoService],
})
export class CentroDeCustoModule {}
