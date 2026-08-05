import { Injectable } from '@nestjs/common';
import { Filial } from '../domain/filial';
import { Endereco } from '../domain/endereco';
import { FilialRepositoryContract } from '../repositories/filial-repository.contract';
import { UsuarioRepositoryContract } from '@module/usuario/info/repositories/usuario-repository.contract';
import { FilialNomeJaCadastradoException } from '../exceptions/filial-nome-ja-cadastrado.exception';
import { FilialCnpjJaCadastradoException } from '../exceptions/filial-cnpj-ja-cadastrado.exception';
import { AdministradorNaoEncontradoException } from '../exceptions/administrador-nao-encontrado.exception';

@Injectable()
export class CriarFilialService {
  constructor(
    private readonly filialRepository: FilialRepositoryContract,
    private readonly usuarioRepository: UsuarioRepositoryContract,
  ) {}

  async execute(
    nome: string,
    cnpj: string,
    administradorId: number,
    endereco: {
      logradouro: string;
      numero: string;
      bairro: string;
      cidade: string;
      uf: string;
      cep: string;
      latitude: number;
      longitude: number;
      complemento?: string;
    },
  ): Promise<Filial> {
    const nomeExiste = await this.filialRepository.existePorNome(nome);

    if (nomeExiste) {
      throw new FilialNomeJaCadastradoException(nome);
    }

    const cnpjExiste = await this.filialRepository.existePorCnpj(cnpj);

    if (cnpjExiste) {
      throw new FilialCnpjJaCadastradoException(cnpj);
    }

    const administrador = await this.usuarioRepository.buscar(administradorId);

    if (!administrador) {
      throw new AdministradorNaoEncontradoException(administradorId);
    }

    const enderecoObj = new Endereco(
      endereco.logradouro,
      endereco.numero,
      endereco.bairro,
      endereco.cidade,
      endereco.uf,
      endereco.cep,
      endereco.latitude,
      endereco.longitude,
      0,
      endereco.complemento,
    );

    const filial = new Filial(nome, cnpj, enderecoObj);

    return this.filialRepository.criar(filial);
  }
}
