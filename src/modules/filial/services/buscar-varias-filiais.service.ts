import { Injectable } from '@nestjs/common';
import { DirecaoOrdenacao } from '@common/enums/direcao-ordenacao.enum';
import { CampoOrdenacaoFilial } from '../enums/ordenacao-filial.enum';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { FilialRepositoryContract } from '../repositories/filial-repository.contract';
import { Filial } from '../domain/filial';

@Injectable()
export class BuscarVariasFiliaisService {
  constructor(private readonly filialRepository: FilialRepositoryContract) {}

  async execute(filtros: {
    nome?: string;
    cnpj?: string;
    endereco?: string;
    ordenarPor?: CampoOrdenacaoFilial;
    direcao?: DirecaoOrdenacao;
    page: number;
    limit: number;
  }): Promise<PaginatedResponseInterface<Filial>> {
    return this.filialRepository.buscarVarios({
      nome: filtros.nome,
      cnpj: filtros.cnpj,
      endereco: filtros.endereco,
      ordenarPor: filtros.ordenarPor,
      direcao: filtros.direcao,
      page: filtros.page,
      limit: filtros.limit,
    });
  }
}
