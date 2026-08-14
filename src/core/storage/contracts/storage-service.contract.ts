import { Readable } from 'node:stream';
import { ArquivoSalvoInterface } from '../interfaces/arquivo-salvo.interface';

export abstract class StorageServiceContract {
  abstract salvar(arquivo: {
    conteudo: Buffer;
    nomeOriginal: string;
    mimeType: string;
    pasta: string;
  }): Promise<ArquivoSalvoInterface>;

  abstract ler(chave: string): Promise<Buffer>;
  abstract lerComoDataUrl(chave: string): Promise<string>;
  abstract abrirStream(chave: string): Promise<Readable>;
  abstract remover(chave: string): Promise<void>;
  abstract existe(chave: string): Promise<boolean>;
}
