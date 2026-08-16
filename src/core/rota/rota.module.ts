import { Module } from '@nestjs/common';
import { RotaServiceContract } from './contracts/rota-service.contract';
import { HaversineRotaService } from './services/haversine-rota.service';

@Module({
  providers: [{ provide: RotaServiceContract, useClass: HaversineRotaService }],
  exports: [RotaServiceContract],
})
export class RotaModule {}
