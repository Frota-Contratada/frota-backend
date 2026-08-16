import { Injectable } from '@nestjs/common';
import { TipoVeiculo } from '../domain/tipo-veiculo';
import { CatalogoSolicitacaoRepositoryContract } from '../repositories/catalogo-solicitacao-repository.contract';

@Injectable()
export class BuscarTiposVeiculoService {
  constructor(
    private readonly catalogoRepository: CatalogoSolicitacaoRepositoryContract,
  ) {}

  async execute(): Promise<TipoVeiculo[]> {
    return this.catalogoRepository.buscarTiposVeiculo();
  }
}
