import { Injectable } from '@nestjs/common';
import { FilialNaoEncontradaException } from '../exceptions/filial-nao-encontrada.exception';
import { FilialRepositoryContract } from '../repositories/filial-repository.contract';
import { Filial } from '../domain/filial';

@Injectable()
export class BuscarFilialService {
  constructor(private readonly filialRepository: FilialRepositoryContract) {}

  async execute(id: number): Promise<Filial> {
    const filial = await this.filialRepository.buscar(id);

    if (!filial) {
      throw new FilialNaoEncontradaException(id);
    }

    return filial;
  }
}
