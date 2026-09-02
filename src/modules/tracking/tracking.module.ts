import { Module } from '@nestjs/common';
import { AuthModule } from '@core/auth/auth.module';
import { PrismaModule } from '@core/prisma/prisma.module';
import { BuscarTrackingController } from './controllers/buscar-tracking.controller';
import { ConcluirParadaController } from './controllers/concluir-parada.controller';
import { FinalizarCorridaController } from './controllers/finalizar-corrida.controller';
import { IniciarEsperaController } from './controllers/iniciar-espera.controller';
import { RecalcularRotaController } from './controllers/recalcular-rota.controller';
import { RetomarCorridaController } from './controllers/retomar-corrida.controller';
import { SalvarPosicaoPassageiroController } from './controllers/salvar-posicao-passageiro.controller';
import { SalvarPosicoesVeiculoController } from './controllers/salvar-posicoes-veiculo.controller';
import { TrackingGateway } from './gateways/tracking.gateway';
import { BuscarTrackingService } from './services/buscar-tracking.service';
import { ConcluirParadaService } from './services/concluir-parada.service';
import { FinalizarCorridaService } from './services/finalizar-corrida.service';
import { IniciarEsperaService } from './services/iniciar-espera.service';
import { RecalcularRotaService } from './services/recalcular-rota.service';
import { RetomarCorridaService } from './services/retomar-corrida.service';
import { SalvarPosicaoPassageiroService } from './services/salvar-posicao-passageiro.service';
import { SalvarPosicoesVeiculoService } from './services/salvar-posicoes-veiculo.service';
import { TomTomRouteService } from './services/tomtom-route.service';
import { TrackingEventsService } from './services/tracking-events.service';
import { TrackingService } from './services/tracking.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [
    BuscarTrackingController,
    SalvarPosicoesVeiculoController,
    SalvarPosicaoPassageiroController,
    RecalcularRotaController,
    IniciarEsperaController,
    RetomarCorridaController,
    FinalizarCorridaController,
    ConcluirParadaController,
  ],
  providers: [
    TomTomRouteService,
    TrackingEventsService,
    TrackingService,
    BuscarTrackingService,
    SalvarPosicoesVeiculoService,
    SalvarPosicaoPassageiroService,
    RecalcularRotaService,
    IniciarEsperaService,
    RetomarCorridaService,
    FinalizarCorridaService,
    ConcluirParadaService,
    TrackingGateway,
  ],
  exports: [TrackingService],
})
export class TrackingModule {}
