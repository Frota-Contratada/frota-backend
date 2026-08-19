import { Injectable } from '@nestjs/common';
import { Motivo } from '../domain/motivo';
import { TipoMotivo } from '../enums/tipo-motivo.enum';
import { CatalogoSolicitacaoRepositoryContract } from '../repositories/catalogo-solicitacao-repository.contract';

@Injectable()
export class BuscarMotivosService {
  constructor(
    private readonly catalogoRepository: CatalogoSolicitacaoRepositoryContract,
  ) {}

  async execute(tipo?: TipoMotivo): Promise<Motivo[]> {
    return this.catalogoRepository.buscarMotivos(tipo);
  }
}
