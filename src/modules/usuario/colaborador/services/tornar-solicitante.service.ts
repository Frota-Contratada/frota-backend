import { Injectable } from '@nestjs/common';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { CentroCustoDeOutraFilialException } from '@module/centro-de-custo/exceptions/centro-custo-de-outra-filial.exception';
import { CentroCustoInativoException } from '@module/centro-de-custo/exceptions/centro-custo-inativo.exception';
import { CentroCustoNaoEncontradoException } from '@module/centro-de-custo/exceptions/centro-custo-nao-encontrado.exception';
import { CentroCustoSemAprovadorException } from '@module/centro-de-custo/exceptions/centro-custo-sem-aprovador.exception';
import { CentroCustoRepositoryContract } from '@module/centro-de-custo/repositories/centro-custo-repository.contract';
import { Colaborador } from '../domain/colaborador';
import { ColaboradorDeOutraFilialException } from '../exceptions/colaborador-de-outra-filial.exception';
import { ColaboradorNaoEncontradoException } from '../exceptions/colaborador-nao-encontrado.exception';
import { ColaboradorSemFilialException } from '../exceptions/colaborador-sem-filial.exception';
import { ColaboradorRepositoryContract } from '../repositories/colaborador-repository.contract';

@Injectable()
export class TornarSolicitanteService {
  constructor(
    private readonly colaboradorRepository: ColaboradorRepositoryContract,
    private readonly centroCustoRepository: CentroCustoRepositoryContract,
  ) {}

  async execute(params: {
    colaboradorId: number;
    centroCustoId: number;
    filialId?: number;
  }): Promise<Colaborador> {
    const { colaboradorId, centroCustoId, filialId } = params;

    const colaborador = await this.colaboradorRepository.buscar(colaboradorId);

    if (!colaborador) {
      throw new ColaboradorNaoEncontradoException(colaboradorId);
    }

    if (filialId && colaborador.filialId !== filialId) {
      throw new ColaboradorDeOutraFilialException(colaboradorId);
    }

    if (!colaborador.filialId) {
      throw new ColaboradorSemFilialException(colaboradorId);
    }

    const centroCusto = await this.centroCustoRepository.buscar(
      colaborador.filialId,
      centroCustoId,
    );

    if (!centroCusto) {
      throw new CentroCustoNaoEncontradoException(
        colaborador.filialId,
        centroCustoId,
      );
    }

    if (centroCusto.filialId !== colaborador.filialId) {
      throw new CentroCustoDeOutraFilialException(
        centroCustoId,
        colaborador.filialId,
      );
    }

    if (centroCusto.dataDesativacao) {
      throw new CentroCustoInativoException(
        colaborador.filialId,
        centroCustoId,
      );
    }

    const temAprovador =
      await this.centroCustoRepository.existeAprovadorNoCentroCusto(
        colaborador.filialId,
        centroCustoId,
      );

    if (!temAprovador) {
      throw new CentroCustoSemAprovadorException(
        colaborador.filialId,
        centroCustoId,
      );
    }

    await this.colaboradorRepository.atualizarCentroCusto(
      colaboradorId,
      centroCustoId,
    );
    await this.colaboradorRepository.concederPerfil(
      colaboradorId,
      TipoPerfil.SOLICITANTE,
    );

    const atualizado = await this.colaboradorRepository.buscar(colaboradorId);

    if (!atualizado) {
      throw new ColaboradorNaoEncontradoException(colaboradorId);
    }

    return atualizado;
  }
}
