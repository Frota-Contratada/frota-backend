import { Injectable, Logger } from '@nestjs/common';
import { StorageServiceContract } from '@core/storage/contracts/storage-service.contract';
import { ArquivoRecebidoInterface } from '@core/storage/interfaces/arquivo-recebido.interface';
import { ValidarArquivoService } from '@core/storage/services/validar-arquivo.service';
import { Usuario } from '../domain/usuario';
import { MimeTypeFotoPerfilEnum } from '../enums/mime-type-foto-perfil.enum';
import { FalhaAoRemoverFotoPerfilException } from '../exceptions/falha-ao-remover-foto-perfil.exception';
import { UsuarioNaoEncontradoException } from '../exceptions/usuario-nao-encontrado.exception';
import { UsuarioRepositoryContract } from '../repositories/usuario-repository.contract';

@Injectable()
export class AtualizarFotoPerfilService {
  private readonly logger = new Logger(AtualizarFotoPerfilService.name);

  constructor(
    private readonly usuarioRepository: UsuarioRepositoryContract,
    private readonly storageService: StorageServiceContract,
    private readonly validarArquivoService: ValidarArquivoService,
  ) {}

  async execute(
    usuarioId: number,
    arquivo?: ArquivoRecebidoInterface,
  ): Promise<Usuario> {
    this.validarArquivoService.validar(
      arquivo,
      Object.values(MimeTypeFotoPerfilEnum),
    );

    const usuario = await this.usuarioRepository.buscar(usuarioId);

    if (!usuario) {
      throw new UsuarioNaoEncontradoException();
    }

    const arquivoSalvo = await this.storageService.salvar({
      conteudo: arquivo.buffer,
      nomeOriginal: arquivo.originalname,
      mimeType: arquivo.mimetype,
      pasta: `usuarios/${usuarioId}/foto-perfil`,
    });

    let usuarioAtualizado: Usuario;

    try {
      usuarioAtualizado = await this.usuarioRepository.atualizarFotoPerfil(
        usuarioId,
        arquivoSalvo.chave,
      );

      usuarioAtualizado.fotoPerfil = await this.storageService.lerComoDataUrl(
        arquivoSalvo.chave,
      );
    } catch (erro) {
      await this.removerArquivoEnviado(arquivoSalvo.chave);
      throw erro;
    }

    await this.removerArquivoAnterior(usuario.caminhoFotoPerfil);

    return usuarioAtualizado;
  }

  private async removerArquivoEnviado(chave: string): Promise<void> {
    try {
      await this.storageService.remover(chave);
    } catch {
      throw new FalhaAoRemoverFotoPerfilException();
    }
  }

  private async removerArquivoAnterior(chave?: string): Promise<void> {
    if (!chave) {
      return;
    }

    try {
      await this.storageService.remover(chave);
    } catch {
      this.logger.warn(`Foto de perfil anterior não removida: ${chave}`);
    }
  }
}
