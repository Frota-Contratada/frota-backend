import { Injectable } from '@nestjs/common';
import { UsuarioRepositoryContract } from '@module/usuario/info/repositories/usuario-repository.contract';
import { CentroCusto } from '../domain/centro-custo';
import { CentroCustoRepositoryContract } from '../repositories/centro-custo-repository.contract';
import { UsuarioNaoEncontradoException } from '@module/usuario/info/exceptions/usuario-nao-encontrado.exception';
import { UsuarioSemFilialException } from '../exceptions/usuario-sem-filial.exception';

export interface CentroCustoComAprovador {
  centroCusto: CentroCusto;
  temAprovador: boolean;
}

@Injectable()
export class BuscarCentrosCustoService {
  constructor(
    private readonly centroCustoRepository: CentroCustoRepositoryContract,
    private readonly usuarioRepository: UsuarioRepositoryContract,
  ) {}

  async execute(usuarioId: number): Promise<CentroCustoComAprovador[]> {
    const usuario = await this.usuarioRepository.buscar(usuarioId);

    if (!usuario) {
      throw new UsuarioNaoEncontradoException();
    }

    if (usuario.filialId == null) {
      throw new UsuarioSemFilialException(usuarioId);
    }

    const [centrosCusto, idsComAprovador] = await Promise.all([
      this.centroCustoRepository.buscarPorFilial(usuario.filialId),
      this.centroCustoRepository.buscarIdsComAprovador(usuario.filialId),
    ]);

    const comAprovador = new Set(idsComAprovador);

    return centrosCusto.map((centroCusto) => ({
      centroCusto,
      temAprovador: comAprovador.has(centroCusto.id),
    }));
  }
}
