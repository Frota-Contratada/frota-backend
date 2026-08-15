import { Module } from '@nestjs/common';
import { PrismaModule } from '@core/prisma/prisma.module';
import { CentroCustoRepositoryContract } from './repositories/centro-custo-repository.contract';
import { PrismaCentroCustoRepository } from './repositories/prisma-centro-custo.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: CentroCustoRepositoryContract,
      useClass: PrismaCentroCustoRepository,
    },
  ],
  exports: [CentroCustoRepositoryContract],
})
export class CentroDeCustoModule {}
