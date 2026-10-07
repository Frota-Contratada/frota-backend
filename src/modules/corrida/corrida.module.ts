import { Module } from '@nestjs/common';
import { PrismaModule } from '@core/prisma/prisma.module';
import { NotificacaoModule } from '@module/notificacao/notificacao.module';
import { CorridaController } from './controllers/corrida.controller';
import { PrismaCorridaRepository } from './repositories/prisma-corrida.repository';
import { BuscarCorridasService } from './services/buscar-corridas.service';
import { CancelarCorridaService } from './services/cancelar-corrida.service';

@Module({
  imports: [PrismaModule, NotificacaoModule],
  controllers: [CorridaController],
  providers: [
    PrismaCorridaRepository,
    BuscarCorridasService,
    CancelarCorridaService,
  ],
})
export class CorridaModule {}
