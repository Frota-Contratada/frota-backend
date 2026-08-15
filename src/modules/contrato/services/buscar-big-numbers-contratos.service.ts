import { Injectable } from '@nestjs/common';
import { ContratoBigNumbers } from '../domain/types/contrato-big-numbers.type';
import { ContratoRepositoryContract } from '../repositories/contrato-repository.contract';

@Injectable()
export class BuscarBigNumbersContratosService {
  constructor(
    private readonly contratoRepository: ContratoRepositoryContract,
  ) {}

  async execute(filtros: {
    filialId?: number;
    fornecedorId?: number;
    vigenciaDe?: Date;
    vigenciaAte?: Date;
  }): Promise<ContratoBigNumbers> {
    return this.contratoRepository.buscarBigNumbers(filtros);
  }
}
