import { Injectable } from '@nestjs/common';
import { Colaborador } from '../domain/colaborador';
import { ColaboradorNaoEncontradoException } from '../exceptions/colaborador-nao-encontrado.exception';
import { ColaboradorRepositoryContract } from '../repositories/colaborador-repository.contract';

@Injectable()
export class BuscarPerfisDoColaboradorService {
  constructor(
    private readonly colaboradorRepository: ColaboradorRepositoryContract,
  ) {}

  async execute(colaboradorId: number): Promise<Colaborador> {
    const colaborador = await this.colaboradorRepository.buscar(colaboradorId);

    if (!colaborador) {
      throw new ColaboradorNaoEncontradoException(colaboradorId);
    }

    return colaborador;
  }
}
