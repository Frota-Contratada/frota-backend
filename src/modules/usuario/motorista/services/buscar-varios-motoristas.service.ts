import { Injectable } from '@nestjs/common';
import { DirecaoOrdenacao } from '@common/enums/direcao-ordenacao.enum';
import { CampoOrdenacaoMotorista } from '../enums/ordenacao-motorista.enum';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { Motorista } from '../domain/motorista';
import { MotoristaRepositoryContract } from '../repositories/motorista-repository.contract';

@Injectable()
export class BuscarVariosMotoristasService {
  constructor(
    private readonly motoristaRepository: MotoristaRepositoryContract,
  ) {}

  async execute(filtros: {
    nome?: string;
    cpf?: string;
    ordenarPor?: CampoOrdenacaoMotorista;
    direcao?: DirecaoOrdenacao;
    page: number;
    limit: number;
  }): Promise<PaginatedResponseInterface<Motorista>> {
    return this.motoristaRepository.buscarVarios({
      nome: filtros.nome,
      cpf: filtros.cpf,
      ordenarPor: filtros.ordenarPor,
      direcao: filtros.direcao,
      page: filtros.page,
      limit: filtros.limit,
    });
  }
}
