import { Injectable } from '@nestjs/common';
import { FilialNaoEncontradaException } from '../exceptions/filial-nao-encontrada.exception';
import {
  FilialRepositoryContract,
  FiltrosFilial,
} from '../repositories/filial-repository.contract';
import { Filial } from '../domain/filial';

@Injectable()
export class BuscarFilialService {
  constructor(private readonly filialRepository: FilialRepositoryContract) {}

  async executar(id: number): Promise<Filial> {
    const filial = await this.filialRepository.buscar(id);

    if (!filial) {
      throw new FilialNaoEncontradaException(id);
    }

    return filial;
  }

  async executarVarios(filtros: FiltrosFilial): Promise<Filial[]> {
    return this.filialRepository.buscarVarios(filtros);
  }
}
