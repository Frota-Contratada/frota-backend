import { Injectable } from '@nestjs/common';
import { TipoCorrida } from '../domain/tipo-corrida';
import { CatalogoSolicitacaoRepositoryContract } from '../repositories/catalogo-solicitacao-repository.contract';

@Injectable()
export class BuscarTiposCorridaService {
  constructor(
    private readonly catalogoRepository: CatalogoSolicitacaoRepositoryContract,
  ) {}

  async execute(): Promise<TipoCorrida[]> {
    return this.catalogoRepository.buscarTiposCorrida();
  }
}
