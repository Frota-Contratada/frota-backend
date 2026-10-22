import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ApiRespostaDe } from '@common/decorators/api-resposta.decorator';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { CancelarSolicitacaoService } from '../services/cancelar-solicitacao.service';
import { CancelarSolicitacaoRequestDto } from './dtos/request/cancelar-solicitacao-request.dto';
import { SolicitacaoDto } from './dtos/response/solicitacao.dto';

@ApiTags('Solicitação')
@ApiBearerAuth()
@Controller()
export class CancelarSolicitacaoController {
  constructor(
    private readonly cancelarSolicitacaoService: CancelarSolicitacaoService,
  ) {}

  @Patch(':id/cancelamento')
  @Perfis(
    TipoPerfil.SOLICITANTE,
    TipoPerfil.SOLICITANTE_EMERGENCIA,
    TipoPerfil.APROVADOR,
    TipoPerfil.ADMIN_FILIAL,
  )
  @ApiRespostaDe(SolicitacaoDto)
  async handle(
    @CurrentUser() usuario: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
    @Body() body: CancelarSolicitacaoRequestDto,
  ): Promise<ResponseInterface<SolicitacaoDto>> {
    const solicitacao = await this.cancelarSolicitacaoService.execute(
      id,
      body.motivoCancelamentoId,
      usuario,
    );

    return { response: SolicitacaoDto.aPartirDoDominio(solicitacao) };
  }
}
