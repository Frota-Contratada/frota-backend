import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { Veiculo } from '../domain/veiculo';
import { FornecedorDoVeiculoObrigatorioException } from '../exceptions/fornecedor-do-veiculo-obrigatorio.exception';
import { PlacaJaCadastradaException } from '../exceptions/placa-ja-cadastrada.exception';
import { VeiculoRepositoryContract } from '../repositories/veiculo-repository.contract';
import { ResolverEscopoVeiculoService } from './resolver-escopo-veiculo.service';

export interface CriarVeiculoInput {
  placa: string;
  tipoVeiculoId: number;
  modelo?: string;
  fornecedorId?: number;
}

@Injectable()
export class CriarVeiculoService {
  constructor(
    private readonly veiculoRepository: VeiculoRepositoryContract,
    private readonly resolverEscopoVeiculo: ResolverEscopoVeiculoService,
  ) {}

  async execute(
    usuario: AuthenticatedUser,
    input: CriarVeiculoInput,
  ): Promise<Veiculo> {
    const escopo = await this.resolverEscopoVeiculo.execute(
      usuario,
      input.fornecedorId,
    );

    if (escopo.fornecedorId == null) {
      throw new FornecedorDoVeiculoObrigatorioException();
    }

    if (await this.veiculoRepository.existePlaca(input.placa)) {
      throw new PlacaJaCadastradaException(input.placa);
    }

    return this.veiculoRepository.criar(
      new Veiculo(
        0,
        escopo.fornecedorId,
        input.tipoVeiculoId,
        input.placa,
        DateTime.now(),
        input.modelo,
      ),
    );
  }
}
