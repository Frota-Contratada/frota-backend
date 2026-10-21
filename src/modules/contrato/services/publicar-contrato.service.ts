import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { Contrato } from '../domain/contrato';
import { ContratoNaoEncontradoException } from '../exceptions/contrato-nao-encontrado.exception';
import { ContratoRepositoryContract } from '../repositories/contrato-repository.contract';
import { ValidarAcessoAoContratoService } from './validar-acesso-ao-contrato.service';

/**
 * Leva o contrato de rascunho a publicado. Só contratos publicados entram na
 * precificação das solicitações.
 */
@Injectable()
export class PublicarContratoService {
  constructor(
    private readonly contratoRepository: ContratoRepositoryContract,
    private readonly validarAcessoAoContrato: ValidarAcessoAoContratoService,
  ) {}

  async execute(
    contratoId: number,
    usuario: AuthenticatedUser,
  ): Promise<Contrato> {
    const contrato = await this.contratoRepository.buscar(contratoId);

    if (!contrato) {
      throw new ContratoNaoEncontradoException(contratoId);
    }

    await this.validarAcessoAoContrato.execute(contratoId, usuario);

    return this.contratoRepository.publicar(contratoId);
  }
}
