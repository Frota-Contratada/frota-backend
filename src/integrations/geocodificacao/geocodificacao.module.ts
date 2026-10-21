import { Module } from '@nestjs/common';
import { PhotonClienteService } from './services/photon-cliente.service';
import { TomTomClienteService } from './services/tomtom-cliente.service';
import { ViaCepClienteService } from './services/viacep-cliente.service';

@Module({
  providers: [TomTomClienteService, PhotonClienteService, ViaCepClienteService],
  exports: [TomTomClienteService, PhotonClienteService, ViaCepClienteService],
})
export class GeocodificacaoModule {}
