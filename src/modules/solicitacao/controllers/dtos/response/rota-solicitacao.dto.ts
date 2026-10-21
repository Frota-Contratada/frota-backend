import { ApiProperty } from '@nestjs/swagger';
import { RotaCalculadaInterface } from '@core/rota/interfaces/rota-calculada.interface';

export class CoordenadaRotaDto {
  @ApiProperty({ example: -23.3045 })
  latitude: number;

  @ApiProperty({ example: -51.1696 })
  longitude: number;
}

export class RotaSolicitacaoDto {
  @ApiProperty({ example: 12.4 })
  distanciaKm: number;

  @ApiProperty({ example: 25 })
  duracaoMinutos: number;

  @ApiProperty({
    type: [CoordenadaRotaDto],
    description:
      'Traçado pelas vias. Vazio quando o roteirizador está indisponível.',
  })
  coordenadas: CoordenadaRotaDto[];

  constructor(rota: RotaCalculadaInterface) {
    this.distanciaKm = rota.distanciaKm;
    this.duracaoMinutos = rota.duracaoMinutos;
    this.coordenadas = (rota.coordenadas ?? []).map((ponto) => ({
      latitude: ponto.latitude,
      longitude: ponto.longitude,
    }));
  }
}
