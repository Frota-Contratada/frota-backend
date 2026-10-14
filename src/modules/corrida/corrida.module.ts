import { Module } from '@nestjs/common';
import { PrismaModule } from '@core/prisma/prisma.module';
import { NotificacaoModule } from '@module/notificacao/notificacao.module';
import { BuscarCorridasController } from './controllers/buscar-corridas.controller';
import { CancelarCorridaController } from './controllers/cancelar-corrida.controller';
import { PrismaCorridaRepository } from './repositories/prisma-corrida.repository';
import { BuscarCorridasService } from './services/buscar-corridas.service';
import { CancelarCorridaService } from './services/cancelar-corrida.service';

@Module({
  imports: [PrismaModule, NotificacaoModule],
  controllers: [BuscarCorridasController, CancelarCorridaController],
  providers: [
    PrismaCorridaRepository,
    BuscarCorridasService,
    CancelarCorridaService,
  ],
})
export class CorridaModule {}
