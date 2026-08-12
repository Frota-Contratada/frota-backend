import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageServiceContract } from '@core/storage/contracts/storage-service.contract';
import { TIPOS_IMAGEM_PERMITIDOS } from '@core/storage/constants/tipos-imagem-permitidos.constant';
import { ArquivoRecebidoInterface } from '@core/storage/interfaces/arquivo-recebido.interface';
import { ValidarArquivoService } from '@core/storage/services/validar-arquivo.service';
import { Usuario } from '../domain/usuario';
import { FalhaAoRemoverFotoPerfilException } from '../exceptions/falha-ao-remover-foto-perfil.exception';
import { UsuarioRepositoryContract } from '../repositories/usuario-repository.contract';

@Injectable()
export class AtualizarFotoPerfilService {
  constructor(
    private readonly usuarioRepository: UsuarioRepositoryContract,
    private readonly storageService: StorageServiceContract,
    private readonly validarArquivoService: ValidarArquivoService,
  ) {}

  async execute(
    usuarioId: number,
    arquivo?: ArquivoRecebidoInterface,
  ): Promise<Usuario> {
    this.validarArquivoService.validar(arquivo, TIPOS_IMAGEM_PERMITIDOS);

    const usuario = await this.usuarioRepository.buscar(usuarioId);

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const arquivoSalvo = await this.storageService.salvar({
      conteudo: arquivo.buffer,
      nomeOriginal: arquivo.originalname,
      pasta: `usuarios/${usuarioId}/foto-perfil`,
    });

    let usuarioAtualizado: Usuario;

    try {
      usuarioAtualizado = await this.usuarioRepository.atualizarFotoPerfil(
        usuarioId,
        arquivoSalvo.chave,
      );
    } catch (erro) {
      await this.removerArquivo(arquivoSalvo.chave);
      throw erro;
    }

    if (usuario.caminhoFotoPerfil) {
      await this.removerArquivo(usuario.caminhoFotoPerfil);
    }

    usuarioAtualizado.fotoPerfil = `data:${arquivo.mimetype};base64,${arquivo.buffer.toString(
      'base64',
    )}`;

    return usuarioAtualizado;
  }

  private async removerArquivo(chave: string): Promise<void> {
    try {
      await this.storageService.remover(chave);
    } catch {
      throw new FalhaAoRemoverFotoPerfilException();
    }
  }
}
