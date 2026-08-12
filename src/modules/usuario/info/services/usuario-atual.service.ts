import { Injectable, NotFoundException } from '@nestjs/common';
import { extname } from 'node:path';
import { StorageServiceContract } from '@core/storage/contracts/storage-service.contract';
import { Usuario } from '../domain/usuario';
import { FalhaAoCarregarFotoPerfilException } from '../exceptions/falha-ao-carregar-foto-perfil.exception';
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
      throw new NotFoundException('Usuário não encontrado.');
    }

    if (usuario.caminhoFotoPerfil) {
      try {
        const arquivo = await this.storageService.ler(
          usuario.caminhoFotoPerfil,
        );
        const tipoMime = this.obterTipoMime(usuario.caminhoFotoPerfil);

        usuario.fotoPerfil = `data:${tipoMime};base64,${arquivo.toString(
          'base64',
        )}`;
      } catch {
        throw new FalhaAoCarregarFotoPerfilException();
      }
    }

    return usuario;
  }

  private obterTipoMime(chave: string): string {
    const tiposMime: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
    };

    return (
      tiposMime[extname(chave).toLowerCase()] ?? 'application/octet-stream'
    );
  }
}
