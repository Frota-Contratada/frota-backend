import { Injectable } from '@nestjs/common';
import { Motivo } from '../domain/motivo';
import { MotivoJaDesativadoException } from '../exceptions/motivo-ja-desativado.exception';
import { MotivoNaoEncontradoException } from '../exceptions/motivo-nao-encontrado.exception';
import { MotivoRepositoryContract } from '../repositories/motivo-repository.contract';
import { ValidarMotivoDaFilialService } from './validar-motivo-da-filial.service';

/**
 * Desativação lógica. `Motivo` é referenciado por FK em `Solicitacao` e
 * `SolicitacaoCentroCusto`, então a exclusão física quebraria o histórico.
 */
@Injectable()
export class DesativarMotivoService {
  constructor(
    private readonly motivoRepository: MotivoRepositoryContract,
    private readonly validarMotivoDaFilialService: ValidarMotivoDaFilialService,
  ) {}

  /**
   * @param filialId Quando informado, exige que o motivo pertença à filial.
   */
  async execute(id: number, filialId?: number): Promise<Motivo> {
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

    return this.motivoRepository.desativar(id);
  }
}
