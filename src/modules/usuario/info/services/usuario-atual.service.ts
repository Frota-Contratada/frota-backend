import { Injectable, NotFoundException } from '@nestjs/common';
import { Usuario } from '../domain/usuario';
import { UsuarioRepositoryContract } from '../repositories/usuario-repository.contract';

@Injectable()
export class UsuarioAtualService {
  constructor(
    private readonly usuarioRepository: UsuarioRepositoryContract,
  ) {}

  async execute(usuarioId: number): Promise<Usuario> {
    const usuario =
      await this.usuarioRepository.buscarComPerfisVigentes(usuarioId);

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return usuario;
  }
}
