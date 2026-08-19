import { Module } from '@nestjs/common';
import { AuthModule } from '@core/auth/auth.module';
import { PrismaModule } from '@core/prisma/prisma.module';
import { UsuarioInfoModule } from '@module/usuario/info/usuario-info.module';
import { BuscarCentrosCustoController } from './controllers/buscar-centros-custo.controller';
import { BuscarCentrosCustoService } from './services/buscar-centros-custo.service';
import { CentroCustoRepositoryContract } from './repositories/centro-custo-repository.contract';
import { PrismaCentroCustoRepository } from './repositories/prisma-centro-custo.repository';

@Module({
  imports: [PrismaModule, AuthModule, UsuarioInfoModule],
  controllers: [BuscarCentrosCustoController],
  providers: [
    BuscarCentrosCustoService,
    {
      provide: CentroCustoRepositoryContract,
      useClass: PrismaCentroCustoRepository,
    },
  ],
  exports: [CentroCustoRepositoryContract],
})
export class CentroDeCustoModule {}
