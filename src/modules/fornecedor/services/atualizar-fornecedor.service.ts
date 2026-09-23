import { Injectable } from '@nestjs/common';
import { Fornecedor } from '../domain/fornecedor';
import { CnpjCpfJaCadastradoException } from '../exceptions/cnpj-cpf-ja-cadastrado.exception';
import { FornecedorJaCadastradoException } from '../exceptions/fornecedor-ja-cadastrado.exception';
import { FornecedorNaoEncontradoException } from '../exceptions/fornecedor-nao-encontrado.exception';
import { FornecedorRepositoryContract } from '../repositories/fornecedor-repository.contract';
import { ValidarFornecedorDaFilialService } from './validar-fornecedor-da-filial.service';

@Injectable()
export class AtualizarFornecedorService {
  constructor(
    private readonly fornecedorRepository: FornecedorRepositoryContract,
    private readonly validarFornecedorDaFilialService: ValidarFornecedorDaFilialService,
  ) {}

  /**
   * A foto tem rota própria e os vínculos com filiais vêm do contrato, então
   * aqui só mudam nome e CNPJ/CPF.
   *
   * @param filialId Quando informado, exige que o fornecedor esteja vinculado
   * à filial.
   */
  async execute(
    id: number,
    nome: string,
    cnpjCpf: string,
    filialId?: number,
  ): Promise<Fornecedor> {
    const fornecedor = await this.fornecedorRepository.buscar(id);

    if (!fornecedor) {
      throw new FornecedorNaoEncontradoException(id);
    }

    if (filialId !== undefined) {
      await this.validarFornecedorDaFilialService.execute(id, filialId);
    }

    if (
      fornecedor.cnpjCpf !== cnpjCpf &&
      (await this.fornecedorRepository.existePorCnpjCpf(cnpjCpf, id))
    ) {
      throw new CnpjCpfJaCadastradoException(cnpjCpf);
    }

    if (
      fornecedor.nome !== nome &&
      (await this.fornecedorRepository.existeOutroComNomeNasFiliaisDoFornecedor(
        nome,
        id,
      ))
    ) {
      throw new FornecedorJaCadastradoException(nome);
    }

    return this.fornecedorRepository.atualizar(id, nome, cnpjCpf);
  }
}
