import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { Fornecedor } from '../domain/fornecedor';
import { FornecedorRepositoryContract } from '../repositories/fornecedor-repository.contract';
import { FilialRepositoryContract } from '@module/filial/repositories/filial-repository.contract';
import { FornecedorJaCadastradoException } from '../exceptions/fornecedor-ja-cadastrado.exception';
import { CnpjCpfJaCadastradoException } from '../exceptions/cnpj-cpf-ja-cadastrado.exception';
import { FilialNaoEncontradaException } from '@module/filial/exceptions/filial-nao-encontrada.exception';

@Injectable()
export class CriarFornecedorService {
  constructor(
    private readonly fornecedorRepository: FornecedorRepositoryContract,
    private readonly filialRepository: FilialRepositoryContract,
  ) {}

  async execute(
    nome: string,
    cnpjCpf: string,
    filialId: number,
  ): Promise<Fornecedor> {
    const filial = await this.filialRepository.buscar(filialId);

    if (!filial) {
      throw new FilialNaoEncontradaException(filialId);
    }

    const cnpjCpfExiste =
      await this.fornecedorRepository.existePorCnpjCpf(cnpjCpf);

    if (cnpjCpfExiste) {
      throw new CnpjCpfJaCadastradoException(cnpjCpf);
    }

    const jaExisteNaFilial =
      await this.fornecedorRepository.existePorNomeNaFilial(nome, filialId);

    if (jaExisteNaFilial) {
      throw new FornecedorJaCadastradoException(nome);
    }

    const fornecedor = new Fornecedor(nome, cnpjCpf, DateTime.now(), 0);

    return this.fornecedorRepository.criar(fornecedor);
  }
}
