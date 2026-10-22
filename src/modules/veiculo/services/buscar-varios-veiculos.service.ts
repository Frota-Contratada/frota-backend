import { Injectable } from '@nestjs/common';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { Veiculo } from '../domain/veiculo';
import { VeiculoRepositoryContract } from '../repositories/veiculo-repository.contract';
import { ResolverEscopoVeiculoService } from './resolver-escopo-veiculo.service';

@Injectable()
export class BuscarVariosVeiculosService {
  constructor(
    private readonly veiculoRepository: VeiculoRepositoryContract,
    private readonly resolverEscopoVeiculo: ResolverEscopoVeiculoService,
  ) {}

  async execute(
    usuario: AuthenticatedUser,
    filtros: {
      fornecedorId?: number;
      placa?: string;
      ativo?: boolean;
      page: number;
      limit: number;
    },
  ): Promise<PaginatedResponseInterface<Veiculo>> {
    const escopo = await this.resolverEscopoVeiculo.execute(
      usuario,
      filtros.fornecedorId,
    );

    return this.veiculoRepository.buscarVarios({
      ...filtros,
      fornecedorId: escopo.fornecedorId,
      filial: escopo.filial,
    });
  }
}
