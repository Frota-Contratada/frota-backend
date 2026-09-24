import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { DecidirSolicitacaoAprovadorService } from '../services/decidir-solicitacao-aprovador.service';
import { DecisaoAprovadorRequestDto } from './dtos/request/decisao-aprovador-request.dto';
import { SolicitacaoDto } from './dtos/response/solicitacao.dto';

@ApiTags('Solicitação')
@ApiBearerAuth()
@Controller()
export class DecidirSolicitacaoAprovadorController {
  constructor(private readonly service: DecidirSolicitacaoAprovadorService) {}

  @Patch(':id/aprovacao')
  @Perfis(TipoPerfil.APROVADOR)
  async handle(
    @CurrentUser('id') aprovadorId: number,
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
    @Body() body: DecisaoAprovadorRequestDto,
  ): Promise<ResponseInterface<SolicitacaoDto>> {
    const solicitacao = await this.service.execute(id, aprovadorId, {
      decisao: body.decisao,
      fornecedorId: body.fornecedorId,
      motivoRecusaId: body.motivoRecusaId,
    });

    return { response: SolicitacaoDto.aPartirDoDominio(solicitacao) };
  }
}
