import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { FilialNaoEncontradaException } from '@module/filial/exceptions/filial-nao-encontrada.exception';
import { FilialRepositoryContract } from '@module/filial/repositories/filial-repository.contract';
import { Motivo } from '../domain/motivo';
import { TipoMotivo } from '../enums/tipo-motivo.enum';
import { MotivoNomeJaCadastradoException } from '../exceptions/motivo-nome-ja-cadastrado.exception';
import { MotivoRepositoryContract } from '../repositories/motivo-repository.contract';

@Injectable()
export class CriarMotivoService {
  constructor(
    private readonly motivoRepository: MotivoRepositoryContract,
    private readonly filialRepository: FilialRepositoryContract,
  ) {}

  /**
   * @param filialId Omitido cria um motivo global, válido para todas as filiais.
   */
  async execute(
    nome: string,
    tipo: TipoMotivo,
    filialId?: number,
  ): Promise<Motivo> {
    if (filialId !== undefined) {
      const filial = await this.filialRepository.buscar(filialId);

      if (!filial) {
        throw new FilialNaoEncontradaException(filialId);
      }
    }

    const nomeJaCadastrado = await this.motivoRepository.existePorNome({
      nome,
      tipo,
      filialId,
    });

    if (nomeJaCadastrado) {
      throw new MotivoNomeJaCadastradoException(nome, tipo, filialId);
    }

    return this.motivoRepository.criar(
      new Motivo(0, nome, tipo, DateTime.now(), filialId),
    );
  }
}
