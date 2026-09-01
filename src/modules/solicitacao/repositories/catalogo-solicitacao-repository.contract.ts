import { Motivo } from '../domain/motivo';
import { TipoCorrida } from '../domain/tipo-corrida';
import { TipoVeiculo } from '../domain/tipo-veiculo';
import { TipoMotivo } from '../enums/tipo-motivo.enum';

export abstract class CatalogoSolicitacaoRepositoryContract {
  abstract buscarMotivo(id: number): Promise<Motivo | null>;
  abstract buscarMotivos(tipo?: TipoMotivo): Promise<Motivo[]>;
  abstract buscarTipoCorrida(id: number): Promise<TipoCorrida | null>;
  abstract buscarTiposCorrida(): Promise<TipoCorrida[]>;
  abstract buscarTipoVeiculo(id: number): Promise<TipoVeiculo | null>;
  abstract buscarTiposVeiculo(): Promise<TipoVeiculo[]>;
}
