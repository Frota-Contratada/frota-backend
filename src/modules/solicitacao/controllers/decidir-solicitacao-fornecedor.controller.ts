import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { SolicitacaoDto } from './dtos/response/solicitacao.dto';
import { DecisaoFornecedorRequestDto } from './dtos/request/decisao-fornecedor-request.dto';
import { DecidirSolicitacaoFornecedorService } from '../services/decidir-solicitacao-fornecedor.service';

@ApiTags('Solicitação')
@ApiBearerAuth()
@Controller()
export class DecidirSolicitacaoFornecedorController {
  constructor(private readonly service: DecidirSolicitacaoFornecedorService) {}

  @Post(':id/decisao-fornecedor')
  @Perfis(TipoPerfil.ADMIN_FORNECEDOR)
  @ApiOperation({
    summary: 'Decide o próximo passo após a recusa de um motorista',
  })
  async handle(
    @CurrentUser('fornecedorId') fornecedorId: number,
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
    @Body() body: DecisaoFornecedorRequestDto,
  ): Promise<ResponseInterface<SolicitacaoDto>> {
    const solicitacao = await this.service.execute(id, fornecedorId, {
      decisao: body.decisao,
      motoristaId: body.motoristaId,
      veiculoId: body.veiculoId,
      motivo: body.motivo,
    });

    return { response: SolicitacaoDto.aPartirDoDominio(solicitacao) };
  }
}
