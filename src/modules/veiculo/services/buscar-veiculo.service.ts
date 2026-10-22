import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { Veiculo } from '../domain/veiculo';
import { FornecedorDoVeiculoObrigatorioException } from '../exceptions/fornecedor-do-veiculo-obrigatorio.exception';
import { VeiculoNaoEncontradoException } from '../exceptions/veiculo-nao-encontrado.exception';
import { VeiculoRepositoryContract } from '../repositories/veiculo-repository.contract';
import { ResolverEscopoVeiculoService } from './resolver-escopo-veiculo.service';

@Injectable()
export class BuscarVeiculoService {
  constructor(
    private readonly veiculoRepository: VeiculoRepositoryContract,
    private readonly resolverEscopoVeiculo: ResolverEscopoVeiculoService,
  ) {}

  async execute(
    usuario: AuthenticatedUser,
    id: number,
    fornecedorId?: number,
  ): Promise<Veiculo> {
    const escopo = await this.resolverEscopoVeiculo.execute(
      usuario,
      fornecedorId,
    );

    // O id do veículo só é único dentro do fornecedor.
    if (escopo.fornecedorId == null) {
      throw new FornecedorDoVeiculoObrigatorioException();
    }

    const veiculo = await this.veiculoRepository.buscar(
      escopo.fornecedorId,
      id,
    );

    if (!veiculo) {
      throw new VeiculoNaoEncontradoException(id, escopo.fornecedorId);
    }

    return veiculo;
  }
}
