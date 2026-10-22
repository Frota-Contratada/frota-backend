import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { StorageServiceContract } from '@core/storage/contracts/storage-service.contract';
import type { ArquivoRecebidoInterface } from '@core/storage/interfaces/arquivo-recebido.interface';
import { ValidarArquivoService } from '@core/storage/services/validar-arquivo.service';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { UsuarioNaoPertenceAFilialException } from '@module/filial/exceptions/usuario-nao-pertence-a-filial.exception';
import { Contrato } from '../domain/contrato';
import { VinculoContrato } from '../domain/vinculo-contrato';
import { MimeTypeContratoEnum } from '../enums/mime-type-contrato.enum';
import { FalhaAoRemoverArquivoContratoException } from '../exceptions/falha-ao-remover-arquivo-contrato.exception';
import { ContratoRepositoryContract } from '../repositories/contrato-repository.contract';

export interface CriarContratoInput {
  dataVigenciaInicio: Date;
  dataVigenciaFim?: Date;
  empresaId: number;
  filialId: number;
  fornecedorId: number;
  tipoCorridaIds: number[];
}

@Injectable()
export class CriarContratoService {
  constructor(
    private readonly contratoRepository: ContratoRepositoryContract,
    private readonly storageService: StorageServiceContract,
    private readonly validarArquivoService: ValidarArquivoService,
  ) {}

  async execute(
    usuario: AuthenticatedUser,
    input: CriarContratoInput,
    arquivo?: ArquivoRecebidoInterface,
  ): Promise<Contrato> {
    this.validarFilialDoUsuario(usuario, input.empresaId, input.filialId);

    this.validarArquivoService.validar(
      arquivo,
      Object.values(MimeTypeContratoEnum),
    );

    const arquivoSalvo = await this.storageService.salvar({
      conteudo: arquivo.buffer,
      nomeOriginal: arquivo.originalname,
      mimeType: arquivo.mimetype,
      pasta: 'contratos',
    });

    try {
      return await this.contratoRepository.criar(
        new Contrato(
          0,
          arquivoSalvo.chave,
          usuario.id,
          DateTime.fromJSDate(input.dataVigenciaInicio),
          input.dataVigenciaFim == null
            ? undefined
            : DateTime.fromJSDate(input.dataVigenciaFim),
        ),
        new VinculoContrato(
          input.empresaId,
          input.filialId,
          input.fornecedorId,
        ),
        [...new Set(input.tipoCorridaIds)],
      );
    } catch (erro) {
      await this.removerArquivo(arquivoSalvo.chave);
      throw erro;
    }
  }

  /** Admin de filial só contrata para a própria filial. */
  private validarFilialDoUsuario(
    usuario: AuthenticatedUser,
    empresaId: number,
    filialId: number,
  ): void {
    if (usuario.perfis.includes(TipoPerfil.ADMIN_MASTER)) return;

    if (usuario.empresaId !== empresaId || usuario.filialId !== filialId) {
      throw new UsuarioNaoPertenceAFilialException(
        usuario.id,
        filialId,
        TipoPerfil.ADMIN_FILIAL,
      );
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
