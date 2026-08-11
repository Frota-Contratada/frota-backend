import { Injectable } from '@nestjs/common';
import { UsuarioRepositoryContract } from '@module/usuario/info/repositories/usuario-repository.contract';
import { AprovadorCentroCustoRepositoryContract } from '../repositories/aprovador-centro-custo-repository.contract';
import { AprovadorCentroCusto } from '../domain/aprovador-centro-custo';
import { AprovadorNaoEncontradoException } from '../exceptions/aprovador-nao-encontrado.exception';
import { CentroCustoNaoEncontradoException } from '../exceptions/centro-custo-nao-encontrado.exception';
import { AprovadorFilialDivergenteException } from '../exceptions/aprovador-filial-divergente.exception';
import { AprovadorJaVinculadoException } from '../exceptions/aprovador-ja-vinculado.exception';

@Injectable()
export class VincularAprovadorService {
  constructor(
    private readonly aprovadorCentroCustoRepository: AprovadorCentroCustoRepositoryContract,
    private readonly usuarioRepository: UsuarioRepositoryContract,
  ) {}

  async execute(
    usuarioId: number,
    filialId: number,
    centroCustoId: number,
  ): Promise<AprovadorCentroCusto> {
    const usuario = await this.usuarioRepository.buscar(usuarioId);

    if (!usuario) {
      throw new AprovadorNaoEncontradoException(usuarioId);
    }

    const centroCusto =
      await this.aprovadorCentroCustoRepository.buscarCentroCusto(
        filialId,
        centroCustoId,
      );

    if (!centroCusto) {
      throw new CentroCustoNaoEncontradoException(filialId, centroCustoId);
    }

    if (usuario.filialId !== centroCusto.filialId) {
      throw new AprovadorFilialDivergenteException(
        usuarioId,
        centroCusto.filialId,
      );
    }

    const vinculoExistente =
      await this.aprovadorCentroCustoRepository.buscarPorUsuario(usuarioId);

    if (vinculoExistente) {
      throw new AprovadorJaVinculadoException(
        usuarioId,
        vinculoExistente.centroCustoId,
      );
    }

    const aprovador = new AprovadorCentroCusto(
      usuarioId,
      filialId,
      centroCustoId,
    );

    return this.aprovadorCentroCustoRepository.vincular(aprovador);
  }
}
