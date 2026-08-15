import { Injectable } from '@nestjs/common';
import { ColaboradorBigNumbers } from '../domain/types/colaborador-big-numbers.type';
import { ColaboradorRepositoryContract } from '../repositories/colaborador-repository.contract';

@Injectable()
export class BuscarBigNumbersColaboradoresService {
  constructor(
    private readonly colaboradorRepository: ColaboradorRepositoryContract,
  ) {}

  async execute(filtros: {
    nome?: string;
    cpf?: string;
    filialId?: number;
  }): Promise<ColaboradorBigNumbers> {
    return this.colaboradorRepository.buscarBigNumbers({
      nome: filtros.nome,
      cpf: filtros.cpf,
      filialId: filtros.filialId,
    });
  }
}
