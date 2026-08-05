import { Injectable } from '@nestjs/common';
import { Filial } from '../domain/filial';
import { Endereco } from '../domain/endereco';
import { FilialNomeJaCadastradoException } from '../exceptions/filial-nome-ja-cadastrado.exception';
import { FilialNaoEncontradaException } from '../exceptions/filial-nao-encontrada.exception';
import { FilialRepositoryContract } from '../repositories/filial-repository.contract';

@Injectable()
export class AtualizarFilialService {
  constructor(private readonly filialRepository: FilialRepositoryContract) {}

  async executar(
    id: number,
    nome: string,
    enderecoData: {
      logradouro: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cidade: string;
      uf: string;
      cep: string;
      latitude: number;
      longitude: number;
    },
  ): Promise<Filial> {
    const filialAtual = await this.filialRepository.buscar(id);

    if (!filialAtual) {
      throw new FilialNaoEncontradaException(id);
    }

    if (
      filialAtual.nome !== nome &&
      (await this.filialRepository.existePorNome(nome))
    ) {
      throw new FilialNomeJaCadastradoException(nome);
    }

    const endereco = new Endereco(
      enderecoData.logradouro,
      enderecoData.numero,
      enderecoData.bairro,
      enderecoData.cidade,
      enderecoData.uf,
      enderecoData.cep,
      enderecoData.latitude,
      enderecoData.longitude,
      filialAtual.endereco.id,
      enderecoData.complemento,
    );

    return this.filialRepository.atualizar(id, nome, endereco);
  }
}
