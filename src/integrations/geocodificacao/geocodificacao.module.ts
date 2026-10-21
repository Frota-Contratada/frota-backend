import { Module } from '@nestjs/common';
import { TomTomClienteService } from './services/tomtom-cliente.service';

@Module({
  providers: [TomTomClienteService],
  exports: [TomTomClienteService],
})
export class GeocodificacaoModule {}
