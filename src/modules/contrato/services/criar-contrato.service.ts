import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { StorageServiceContract } from '@core/storage/contracts/storage-service.contract';
import type { ArquivoRecebidoInterface } from '@core/storage/interfaces/arquivo-recebido.interface';
import { ValidarArquivoService } from '@core/storage/services/validar-arquivo.service';
import { Contrato } from '../domain/contrato';
import { FalhaAoRemoverArquivoContratoException } from '../exceptions/falha-ao-remover-arquivo-contrato.exception';
import { ContratoRepositoryContract } from '../repositories/contrato-repository.contract';

@Injectable()
export class CriarContratoService {
  constructor(
    private readonly contratoRepository: ContratoRepositoryContract,
    private readonly storageService: StorageServiceContract,
    private readonly validarArquivoService: ValidarArquivoService,
  ) {}

  async execute(
    usuarioCadastroId: number,
    dataVigenciaInicio: Date,
    dataVigenciaFim: Date | undefined,
    arquivo?: ArquivoRecebidoInterface,
  ): Promise<Contrato> {
    this.validarArquivoService.validar(arquivo);

    const arquivoSalvo = await this.storageService.salvar({
      conteudo: arquivo.buffer,
      nomeOriginal: arquivo.originalname,
      pasta: 'contratos',
    });

    try {
      return await this.contratoRepository.criar(
        new Contrato(
          0,
          arquivoSalvo.chave,
          usuarioCadastroId,
          DateTime.fromJSDate(dataVigenciaInicio),
          dataVigenciaFim == null
            ? undefined
            : DateTime.fromJSDate(dataVigenciaFim),
        ),
      );
    } catch (erro) {
      await this.removerArquivo(arquivoSalvo.chave);
      throw erro;
    }
  }

  private async removerArquivo(chave: string): Promise<void> {
    try {
      await this.storageService.remover(chave);
    } catch {
      throw new FalhaAoRemoverArquivoContratoException();
    }
  }
}
