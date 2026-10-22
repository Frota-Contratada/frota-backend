import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { FornecedorDeOutraFilialException } from '@module/fornecedor/exceptions/fornecedor-de-outra-filial.exception';
import { FornecedorRepositoryContract } from '@module/fornecedor/repositories/fornecedor-repository.contract';
import { AcessoAoFornecedorNegadoException } from '../exceptions/acesso-ao-fornecedor-negado.exception';

export interface EscopoVeiculo {
  fornecedorId?: number;
  filial?: { empresaId: number; filialId: number };
}

/**
 * Admin de fornecedor acessa só a própria frota; admin de filial, a dos
 * fornecedores vinculados à filial; admin master, qualquer frota.
 */
@Injectable()
export class ResolverEscopoVeiculoService {
  constructor(
    private readonly fornecedorRepository: FornecedorRepositoryContract,
  ) {}

  async execute(
    usuario: AuthenticatedUser,
    fornecedorId?: number,
  ): Promise<EscopoVeiculo> {
    if (usuario.perfis.includes(TipoPerfil.ADMIN_MASTER)) {
      return { fornecedorId };
    }

    if (
      usuario.perfis.includes(TipoPerfil.ADMIN_FORNECEDOR) &&
      usuario.fornecedorId != null
    ) {
      if (fornecedorId != null && fornecedorId !== usuario.fornecedorId) {
        throw new AcessoAoFornecedorNegadoException(fornecedorId);
      }

      return { fornecedorId: usuario.fornecedorId };
    }

    if (usuario.empresaId == null || usuario.filialId == null) {
      throw new AcessoAoFornecedorNegadoException(fornecedorId ?? 0);
    }

    if (fornecedorId == null) {
      return {
        filial: { empresaId: usuario.empresaId, filialId: usuario.filialId },
      };
    }

    const pertence = await this.fornecedorRepository.pertenceAFilial(
      fornecedorId,
      usuario.empresaId,
      usuario.filialId,
    );

    if (!pertence) {
      throw new FornecedorDeOutraFilialException(
        fornecedorId,
        usuario.filialId,
      );
    }

    return { fornecedorId };
  }
}
