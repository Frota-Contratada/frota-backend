import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { extname } from 'node:path';
import { StorageServiceContract } from '@core/storage/contracts/storage-service.contract';
import { Usuario } from '../domain/usuario';
import { UsuarioRepositoryContract } from '../repositories/usuario-repository.contract';

export type FotoPerfilArquivo = {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
};

@Injectable()
export class AtualizarFotoPerfilService {
  private readonly logger = new Logger(AtualizarFotoPerfilService.name);

  constructor(
    private readonly usuarioRepository: UsuarioRepositoryContract,
    private readonly storageService: StorageServiceContract,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    usuarioId: number,
    arquivo?: FotoPerfilArquivo,
  ): Promise<Usuario> {
    this.validarArquivo(arquivo);

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
      await this.removerSilenciosamente(arquivoSalvo.chave);
      throw erro;
    }

    if (usuario.caminhoFotoPerfil) {
      await this.removerSilenciosamente(usuario.caminhoFotoPerfil);
    }

    return usuarioAtualizado;
  }

  private validarArquivo(
    arquivo?: FotoPerfilArquivo,
  ): asserts arquivo is FotoPerfilArquivo {
    if (!arquivo?.buffer?.length) {
      throw new BadRequestException(
        'Envie uma foto no campo "foto" do formulário.',
      );
    }

    const tamanhoConfiguradoMb = Number(
      this.configService.get<string>('STORAGE_TAMANHO_MAXIMO_MB') ?? 10,
    );
    const tamanhoMaximoMb =
      Number.isFinite(tamanhoConfiguradoMb) && tamanhoConfiguradoMb > 0
        ? tamanhoConfiguradoMb
        : 10;
    const tamanhoMaximo = tamanhoMaximoMb * 1024 * 1024;

    if (arquivo.size > tamanhoMaximo) {
      throw new PayloadTooLargeException(
        `A foto deve ter no máximo ${tamanhoMaximoMb} MB.`,
      );
    }

    const extensao = extname(arquivo.originalname).toLowerCase();
    const tiposPermitidos: Record<string, string[]> = {
      '.jpg': ['image/jpeg'],
      '.jpeg': ['image/jpeg'],
      '.png': ['image/png'],
      '.webp': ['image/webp'],
    };

    if (
      !tiposPermitidos[extensao]?.includes(arquivo.mimetype) ||
      !this.possuiAssinaturaDeImagem(arquivo.buffer, arquivo.mimetype)
    ) {
      throw new UnsupportedMediaTypeException(
        'A foto deve estar no formato JPG, PNG ou WEBP.',
      );
    }
  }

  private possuiAssinaturaDeImagem(buffer: Buffer, mimetype: string): boolean {
    if (mimetype === 'image/jpeg') {
      return buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
    }

    if (mimetype === 'image/png') {
      return buffer
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    }

    if (mimetype === 'image/webp') {
      return (
        buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
        buffer.subarray(8, 12).toString('ascii') === 'WEBP'
      );
    }

    return false;
  }

  private async removerSilenciosamente(chave: string): Promise<void> {
    try {
      await this.storageService.remover(chave);
    } catch (erro) {
      this.logger.warn(
        `Não foi possível remover o arquivo ${chave}: ${
          erro instanceof Error ? erro.message : String(erro)
        }`,
      );
    }
  }
}
