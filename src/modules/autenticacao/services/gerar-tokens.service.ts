import { Injectable } from '@nestjs/common';
import { Plataforma } from '@common/enums/plataforma.enum';
import { TokenCacheServiceContract } from '@core/auth/contracts/token-cache-service.contract';
import { TokenServiceContract } from '@core/auth/contracts/token-service.contract';
import { AuthToken } from '@core/auth/types/auth-token';
import { Usuario } from '@module/usuario/info/domain/usuario';
import { TipoPerfil } from '../enums/tipo-perfil.enum';
import { TipoVinculo } from '../enums/tipo-vinculo.enum';
import { VinculoDoUsuarioAusenteException } from '../exceptions/vinculo-do-usuario-ausente.exception';
import { AutenticacaoRepositoryContract } from '../repositories/autenticacao/autenticacao-repository.contract';

@Injectable()
export class GerarTokensService {
  constructor(
    private readonly autenticacaoRepository: AutenticacaoRepositoryContract,
    private readonly tokenCacheService: TokenCacheServiceContract,
    private readonly tokenService: TokenServiceContract,
  ) {}

  async execute(usuario: Usuario, plataforma: Plataforma): Promise<AuthToken> {
    const perfis = await this.autenticacaoRepository.buscarPerfisVigentes(
      usuario.id,
    );

    this.validarVinculo(usuario, perfis);

    const tokens = await this.tokenService.gerarTokens(
      {
        sub: usuario.id,
        email: usuario.email,
        plataforma,
        perfis,
        filialId: usuario.filialId,
        fornecedorId: usuario.fornecedorId,
      },
      { sub: usuario.id, plataforma, perfis },
    );

    await this.tokenCacheService.salvar(
      usuario.id,
      plataforma,
      tokens.refreshToken,
      tokens.validade,
    );

    return tokens;
  }

  private validarVinculo(usuario: Usuario, perfis: TipoPerfil[]): void {
    const vinculosExigidos = new Set(
      perfis
        .map((perfil) => this.vinculoDoPerfil(perfil))
        .filter((vinculo): vinculo is TipoVinculo => vinculo !== undefined),
    );

    if (vinculosExigidos.has(TipoVinculo.FILIAL) && !usuario.filialId) {
      throw new VinculoDoUsuarioAusenteException(TipoVinculo.FILIAL);
    }

    if (vinculosExigidos.has(TipoVinculo.FORNECEDOR) && !usuario.fornecedorId) {
      throw new VinculoDoUsuarioAusenteException(TipoVinculo.FORNECEDOR);
    }
  }

  private vinculoDoPerfil(perfil: TipoPerfil): TipoVinculo | undefined {
    switch (perfil) {
      case TipoPerfil.APROVADOR:
      case TipoPerfil.SOLICITANTE:
      case TipoPerfil.SOLICITANTE_EMERGENCIA:
      case TipoPerfil.ADMIN_FILIAL:
        return TipoVinculo.FILIAL;
      case TipoPerfil.ADMIN_FORNECEDOR:
      case TipoPerfil.MOTORISTA:
        return TipoVinculo.FORNECEDOR;
      case TipoPerfil.ADMIN_MASTER:
        return undefined;
    }
  }
}
