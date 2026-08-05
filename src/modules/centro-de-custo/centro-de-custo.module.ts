import { Module } from '@nestjs/common';
import { PrismaModule } from '@core/prisma/prisma.module';
import { UsuarioInfoModule } from '@module/usuario/info/usuario-info.module';
import { VincularAprovadorController } from './controllers/vincular-aprovador.controller';
import { VincularAprovadorService } from './services/vincular-aprovador.service';
import { AprovadorCentroCustoRepositoryContract } from './repositories/aprovador-centro-custo-repository.contract';
import { PrismaAprovadorCentroCustoRepository } from './repositories/prisma-aprovador-centro-custo.repository';

@Module({
  imports: [PrismaModule, UsuarioInfoModule],
  controllers: [VincularAprovadorController],
  providers: [
    VincularAprovadorService,
    {
      provide: AprovadorCentroCustoRepositoryContract,
      useClass: PrismaAprovadorCentroCustoRepository,
    },
  ],
  exports: [AprovadorCentroCustoRepositoryContract],
})
export class CentroDeCustoModule {}
