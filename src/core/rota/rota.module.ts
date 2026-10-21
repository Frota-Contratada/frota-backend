import { Module } from '@nestjs/common';
import { GeocodificacaoModule } from '@integration/geocodificacao/geocodificacao.module';
import { RotaServiceContract } from './contracts/rota-service.contract';
import { HaversineRotaService } from './services/haversine-rota.service';
import { TomTomRotaService } from './services/tomtom-rota.service';

@Module({
  imports: [GeocodificacaoModule],
  providers: [
    HaversineRotaService,
    { provide: RotaServiceContract, useClass: TomTomRotaService },
  ],
  exports: [RotaServiceContract],
})
export class RotaModule {}
