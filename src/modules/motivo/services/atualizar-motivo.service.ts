import { Injectable } from '@nestjs/common';
import { Motivo } from '../domain/motivo';
import { TipoMotivo } from '../enums/tipo-motivo.enum';
import { MotivoJaDesativadoException } from '../exceptions/motivo-ja-desativado.exception';
import { MotivoNaoEncontradoException } from '../exceptions/motivo-nao-encontrado.exception';
import { MotivoNomeJaCadastradoException } from '../exceptions/motivo-nome-ja-cadastrado.exception';
import { MotivoRepositoryContract } from '../repositories/motivo-repository.contract';
import { ValidarMotivoDaFilialService } from './validar-motivo-da-filial.service';

@Injectable()
export class AtualizarMotivoService {
  constructor(
    private readonly motivoRepository: MotivoRepositoryContract,
    private readonly validarMotivoDaFilialService: ValidarMotivoDaFilialService,
  ) {}

  /**
   * O escopo do motivo (global ou filial) não é alterado aqui. Para mover um
   * motivo de escopo, desative e crie outro.
   *
   * @param filialId Quando informado, exige que o motivo pertença à filial.
   */
  async execute(
    id: number,
    nome: string,
    tipo: TipoMotivo,
    filialId?: number,
  ): Promise<Motivo> {
    const motivo = await this.motivoRepository.buscar(id);

    if (!motivo) {
      throw new MotivoNaoEncontradoException(id);
    }

    if (filialId !== undefined) {
      this.validarMotivoDaFilialService.execute(motivo, filialId);
    }

    if (!motivo.ativo) {
      throw new MotivoJaDesativadoException(id);
    }

    const nomeJaCadastrado = await this.motivoRepository.existePorNome({
      nome,
      tipo,
      filialId: motivo.filialId,
      ignorarId: id,
    });

    if (nomeJaCadastrado) {
      throw new MotivoNomeJaCadastradoException(nome, tipo, motivo.filialId);
    }

    return this.motivoRepository.atualizar(id, nome, tipo);
  }
}
