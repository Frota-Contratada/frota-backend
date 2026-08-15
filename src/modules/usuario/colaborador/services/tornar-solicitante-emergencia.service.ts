import { Injectable } from '@nestjs/common';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { CentroCustoInativoException } from '@module/centro-de-custo/exceptions/centro-custo-inativo.exception';
import { CentroCustoNaoEncontradoException } from '@module/centro-de-custo/exceptions/centro-custo-nao-encontrado.exception';
import { CentroCustoRepositoryContract } from '@module/centro-de-custo/repositories/centro-custo-repository.contract';
import { Colaborador } from '../domain/colaborador';
import { ColaboradorDeOutraFilialException } from '../exceptions/colaborador-de-outra-filial.exception';
import { ColaboradorNaoEhSolicitanteException } from '../exceptions/colaborador-nao-eh-solicitante.exception';
import { ColaboradorNaoEncontradoException } from '../exceptions/colaborador-nao-encontrado.exception';
import { ColaboradorSemCentroCustoException } from '../exceptions/colaborador-sem-centro-custo.exception';
import { ColaboradorSemFilialException } from '../exceptions/colaborador-sem-filial.exception';
import { ColaboradorRepositoryContract } from '../repositories/colaborador-repository.contract';

@Injectable()
export class TornarSolicitanteEmergenciaService {
  constructor(
    private readonly colaboradorRepository: ColaboradorRepositoryContract,
    private readonly centroCustoRepository: CentroCustoRepositoryContract,
  ) {}

  async execute(params: {
    colaboradorId: number;
    filialId?: number;
  }): Promise<Colaborador> {
    const { colaboradorId, filialId } = params;

    const colaborador = await this.colaboradorRepository.buscar(colaboradorId);

    if (!colaborador) {
      throw new ColaboradorNaoEncontradoException(colaboradorId);
    }

    if (filialId && colaborador.filialId !== filialId) {
      throw new ColaboradorDeOutraFilialException(colaboradorId);
    }

    const ehSolicitante = colaborador.perfis.some(
      (perfil) => perfil.tipoPerfil === TipoPerfil.SOLICITANTE,
    );

    if (!ehSolicitante) {
      throw new ColaboradorNaoEhSolicitanteException(colaboradorId);
    }

    if (!colaborador.filialId) {
      throw new ColaboradorSemFilialException(colaboradorId);
    }

    if (!colaborador.centroCustoId) {
      throw new ColaboradorSemCentroCustoException(colaboradorId);
    }

    const centroCusto = await this.centroCustoRepository.buscar(
      colaborador.filialId,
      colaborador.centroCustoId,
    );

    if (!centroCusto) {
      throw new CentroCustoNaoEncontradoException(
        colaborador.filialId,
        colaborador.centroCustoId,
      );
    }

    if (centroCusto.dataDesativacao) {
      throw new CentroCustoInativoException(
        colaborador.filialId,
        colaborador.centroCustoId,
      );
    }

    await this.colaboradorRepository.concederPerfil(
      colaboradorId,
      TipoPerfil.SOLICITANTE_EMERGENCIA,
    );

    const atualizado = await this.colaboradorRepository.buscar(colaboradorId);

    if (!atualizado) {
      throw new ColaboradorNaoEncontradoException(colaboradorId);
    }

    return atualizado;
  }
}
