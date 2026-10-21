import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { AcessoAoContratoNegadoException } from '../exceptions/acesso-ao-contrato-negado.exception';
import { ContratoRepositoryContract } from '../repositories/contrato-repository.contract';

/**
 * Admin master acessa qualquer contrato; admin de filial, os vinculados à sua
 * filial; admin de fornecedor, os vinculados ao seu fornecedor.
 */
@Injectable()
export class ValidarAcessoAoContratoService {
  constructor(
    private readonly contratoRepository: ContratoRepositoryContract,
  ) {}

  async execute(contratoId: number, usuario: AuthenticatedUser): Promise<void> {
    if (usuario.perfis.includes(TipoPerfil.ADMIN_MASTER)) return;

    const vinculos = await this.contratoRepository.buscarVinculos(contratoId);

    const daFilial =
      usuario.perfis.includes(TipoPerfil.ADMIN_FILIAL) &&
      vinculos.some(
        (vinculo) =>
          vinculo.empresaId === usuario.empresaId &&
          vinculo.filialId === usuario.filialId,
      );
    const doFornecedor =
      usuario.perfis.includes(TipoPerfil.ADMIN_FORNECEDOR) &&
      vinculos.some((vinculo) => vinculo.fornecedorId === usuario.fornecedorId);

    if (!daFilial && !doFornecedor) {
      throw new AcessoAoContratoNegadoException(contratoId);
    }
  }
}
