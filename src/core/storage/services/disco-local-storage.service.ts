import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DateTime } from 'luxon';
import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { Readable } from 'node:stream';
import { StorageServiceContract } from '../contracts/storage-service.contract';
import { ArquivoNaoEncontradoException } from '../exceptions/arquivo-nao-encontrado.exception';
import { ChaveDeArquivoInvalidaException } from '../exceptions/chave-de-arquivo-invalida.exception';
import { ArquivoSalvoInterface } from '../interfaces/arquivo-salvo.interface';

@Injectable()
export class DiscoLocalStorageService
  extends StorageServiceContract
  implements OnModuleInit
{
  private readonly caminhoBase: string;

  constructor(configService: ConfigService) {
    super();

    this.caminhoBase = resolve(
      process.cwd(),
      configService.getOrThrow<string>('STORAGE_CAMINHO_BASE'),
    );
  }

  async onModuleInit(): Promise<void> {
    await mkdir(this.caminhoBase, { recursive: true });
  }

  async salvar(arquivo: {
    conteudo: Buffer;
    nomeOriginal: string;
    pasta: string;
  }): Promise<ArquivoSalvoInterface> {
    const nomeArquivo = this.montarNomeArquivo(arquivo.nomeOriginal);
    const chave = this.montarChave(arquivo.pasta, nomeArquivo);

    const caminhoAbsoluto = this.resolverCaminho(chave);
    const caminhoTemporario = `${caminhoAbsoluto}.tmp`;

    await mkdir(dirname(caminhoAbsoluto), { recursive: true });

    try {
      await writeFile(caminhoTemporario, arquivo.conteudo, { flag: 'wx' });
      await rename(caminhoTemporario, caminhoAbsoluto);
    } catch (erro) {
      await rm(caminhoTemporario, { force: true });
      throw erro;
    }

    return {
      chave,
      nomeArquivo,
      tamanho: arquivo.conteudo.byteLength,
    };
  }

  async ler(chave: string): Promise<Buffer> {
    const caminho = this.resolverCaminho(chave);

    try {
      return await readFile(caminho);
    } catch {
      throw new ArquivoNaoEncontradoException(chave);
    }
  }

  async abrirStream(chave: string): Promise<Readable> {
    const caminho = this.resolverCaminho(chave);

    if (!(await this.existeNoDisco(caminho))) {
      throw new ArquivoNaoEncontradoException(chave);
    }

    return createReadStream(caminho);
  }

  async remover(chave: string): Promise<void> {
    await rm(this.resolverCaminho(chave), { force: true });
  }

  async existe(chave: string): Promise<boolean> {
    return this.existeNoDisco(this.resolverCaminho(chave));
  }

  private montarNomeArquivo(nomeOriginal: string): string {
    const extensao = extname(nomeOriginal)
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '');

    const nomeBase = this.sanitizar(
      nomeOriginal.slice(0, nomeOriginal.length - extname(nomeOriginal).length),
    );

    return `${nomeBase || 'arquivo'}_${randomUUID()}${extensao}`;
  }

  private montarChave(pasta: string, nomeArquivo: string): string {
    const agora = DateTime.now();

    return [
      pasta,
      agora.toFormat('yyyy'),
      agora.toFormat('MM'),
      nomeArquivo,
    ].join('/');
  }

  private resolverCaminho(chave: string): string {
    if (!chave || chave.includes('\0')) {
      throw new ChaveDeArquivoInvalidaException(chave);
    }

    const caminho = resolve(this.caminhoBase, chave);

    if (!caminho.startsWith(this.caminhoBase + sep)) {
      throw new ChaveDeArquivoInvalidaException(chave);
    }

    return caminho;
  }

  private async existeNoDisco(caminho: string): Promise<boolean> {
    try {
      const informacoes = await stat(caminho);
      return informacoes.isFile();
    } catch {
      return false;
    }
  }

  private sanitizar(valor: string): string {
    return valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }
}
