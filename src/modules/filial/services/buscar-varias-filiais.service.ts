import { Injectable } from '@nestjs/common';
import { FilialRepositoryContract } from '../repositories/filial-repository.contract';
import { Filial } from '../domain/filial';

@Injectable()
export class BuscarVariasFiliaisService {
  constructor(private readonly filialRepository: FilialRepositoryContract) {}

  async execute(filtros: {
    nome?: string;
    cnpj?: string;
    endereco?: string;
  }): Promise<Filial[]> {
    return this.filialRepository.buscarVarios({
      nome: filtros.nome,
      cnpj: filtros.cnpj,
      endereco: filtros.endereco,
    });
  }
}
