import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { Motorista } from '../domain/motorista';
import { MotoristaRepositoryContract } from '../repositories/motorista-repository.contract';
import { UsuarioRepositoryContract } from '@module/usuario/info/repositories/usuario-repository.contract';
import { FornecedorRepositoryContract } from '@module/fornecedor/repositories/fornecedor-repository.contract';
import { FornecedorNaoEncontradoException } from '@module/fornecedor/exceptions/fornecedor-nao-encontrado.exception';
import { CpfJaCadastradoException } from '../exceptions/cpf-ja-cadastrado.exception';
import { EmailJaCadastradoException } from '../exceptions/email-ja-cadastrado.exception';

@Injectable()
export class CriarMotoristaService {
  constructor(
    private readonly motoristaRepository: MotoristaRepositoryContract,
    private readonly usuarioRepository: UsuarioRepositoryContract,
    private readonly fornecedorRepository: FornecedorRepositoryContract,
  ) {}

  async execute(
    nome: string,
    email: string,
    cpf: string,
    fornecedorId: number,
  ): Promise<Motorista> {
    const usuarioComMesmoCpf = await this.usuarioRepository.buscarPorCpf(cpf);

    if (usuarioComMesmoCpf) {
      throw new CpfJaCadastradoException(cpf);
    }

    const usuarioComMesmoEmail =
      await this.usuarioRepository.buscarPorEmail(email);

    if (usuarioComMesmoEmail) {
      throw new EmailJaCadastradoException(email);
    }

    const fornecedor = await this.fornecedorRepository.buscar(fornecedorId);

    if (!fornecedor) {
      throw new FornecedorNaoEncontradoException(fornecedorId);
    }

    const motorista = new Motorista(
      nome,
      email,
      DateTime.now(),
      0,
      fornecedorId,
      cpf,
    );

    return this.motoristaRepository.criar(motorista);
  }
}
