import { Injectable } from '@nestjs/common';
import { Motivo } from '../domain/motivo';
import { MotivoDeOutraFilialException } from '../exceptions/motivo-de-outra-filial.exception';
import { MotivoNaoEncontradoException } from '../exceptions/motivo-nao-encontrado.exception';
import { MotivoRepositoryContract } from '../repositories/motivo-repository.contract';

@Injectable()
export class BuscarMotivoService {
  constructor(private readonly motivoRepository: MotivoRepositoryContract) {}

  /**
   * @param filialId Quando informado, restringe a leitura ao escopo da filial:
   * o motivo precisa ser global ou pertencer a ela.
   */
  async execute(id: number, filialId?: number): Promise<Motivo> {
    const motivo = await this.motivoRepository.buscar(id);

    if (!motivo) {
      throw new MotivoNaoEncontradoException(id);
    }

    if (
      filialId !== undefined &&
      !motivo.global &&
      motivo.filialId !== filialId
    ) {
      throw new MotivoDeOutraFilialException(id, filialId);
    }

    return motivo;
  }
}
