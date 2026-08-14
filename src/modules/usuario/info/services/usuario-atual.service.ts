import { Injectable } from '@nestjs/common';
import { StorageServiceContract } from '@core/storage/contracts/storage-service.contract';
import { Usuario } from '../domain/usuario';
import { FalhaAoCarregarFotoPerfilException } from '../exceptions/falha-ao-carregar-foto-perfil.exception';
import { UsuarioNaoEncontradoException } from '../exceptions/usuario-nao-encontrado.exception';
import { UsuarioRepositoryContract } from '../repositories/usuario-repository.contract';

@Injectable()
export class UsuarioAtualService {
  constructor(
    private readonly usuarioRepository: UsuarioRepositoryContract,
    private readonly storageService: StorageServiceContract,
  ) {}

  async execute(usuarioId: number): Promise<Usuario> {
    const usuario =
      await this.usuarioRepository.buscarComPerfisVigentes(usuarioId);

    if (!usuario) {
      throw new UsuarioNaoEncontradoException();
    }

    if (usuario.caminhoFotoPerfil) {
      try {
        usuario.fotoPerfil = await this.storageService.lerComoDataUrl(
          usuario.caminhoFotoPerfil,
        );
      } catch {
        throw new FalhaAoCarregarFotoPerfilException();
      }
    }

    return usuario;
  }
}
