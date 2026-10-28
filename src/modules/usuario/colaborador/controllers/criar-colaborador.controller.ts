import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { Transacional } from '@core/prisma/decorators/transacional.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { TipoVinculo } from '@module/autenticacao/enums/tipo-vinculo.enum';
import { VinculoDoUsuarioAusenteException } from '@module/autenticacao/exceptions/vinculo-do-usuario-ausente.exception';
import { FilialDoColaboradorNaoInformadaException } from '../exceptions/filial-do-colaborador-nao-informada.exception';
import { CriarColaboradorService } from '../services/criar-colaborador.service';
import { CriarColaboradorRequestDto } from './dtos/request/criar-colaborador-request.dto';
import { ColaboradorDto } from './dtos/response/colaborador.dto';

@ApiTags('Colaborador')
@ApiBearerAuth()
@Controller()
export class CriarColaboradorController {
  constructor(
    private readonly criarColaboradorService: CriarColaboradorService,
  ) {}

  @Post()
  @Perfis(TipoPerfil.ADMIN_MASTER, TipoPerfil.ADMIN_FILIAL)
  @Transacional()
  async handle(
    @CurrentUser() usuarioAtual: AuthenticatedUser,
    @Body() body: CriarColaboradorRequestDto,
  ): Promise<ResponseInterface<ColaboradorDto>> {
    const { empresaId, filialId } = this.filialDoCadastro(usuarioAtual, body);

    const colaborador = await this.criarColaboradorService.execute({
      nome: body.nome,
      email: body.email,
      cpf: body.cpf,
      cargo: body.cargo,
      empresaId,
      filialId,
      centroCustoId: body.centroCustoId,
      perfis: body.perfis,
    });

    return { response: new ColaboradorDto(colaborador) };
  }

  // O admin de filial só cadastra na própria filial, seja qual for a enviada.
  private filialDoCadastro(
    usuarioAtual: AuthenticatedUser,
    body: CriarColaboradorRequestDto,
  ): { empresaId: number; filialId: number } {
    if (!usuarioAtual.perfis.includes(TipoPerfil.ADMIN_MASTER)) {
      if (!usuarioAtual.empresaId || !usuarioAtual.filialId) {
        throw new VinculoDoUsuarioAusenteException(TipoVinculo.FILIAL);
      }
      return {
        empresaId: usuarioAtual.empresaId,
        filialId: usuarioAtual.filialId,
      };
    }

    if (!body.empresaId || !body.filialId) {
      throw new FilialDoColaboradorNaoInformadaException();
    }

    return { empresaId: body.empresaId, filialId: body.filialId };
  }
}
