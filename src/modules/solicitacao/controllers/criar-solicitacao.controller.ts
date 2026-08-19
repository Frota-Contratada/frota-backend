import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DateTime } from 'luxon';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ApiRespostaDe } from '@common/decorators/api-resposta.decorator';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { CriarSolicitacaoService } from '../services/criar-solicitacao.service';
import { CriarSolicitacaoRequestDto } from './dtos/request/criar-solicitacao-request.dto';
import { SolicitacaoDto } from './dtos/response/solicitacao.dto';

@ApiTags('Solicitação')
@ApiBearerAuth()
@Controller()
export class CriarSolicitacaoController {
  constructor(
    private readonly criarSolicitacaoService: CriarSolicitacaoService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Perfis(TipoPerfil.SOLICITANTE, TipoPerfil.SOLICITANTE_EMERGENCIA)
  @ApiOperation({
    summary: 'Cria uma solicitação de corrida',
    description:
      'Calcula o trajeto, escolhe o fornecedor com contrato vigente mais barato para a filial do solicitante e abre a solicitação como pendente, com um rateio por centro de custo aguardando aprovação.',
  })
  @ApiRespostaDe(SolicitacaoDto, {
    status: HttpStatus.CREATED,
    description: 'Solicitação criada e aguardando aprovação.',
  })
  async handle(
    @CurrentUser('id') solicitanteId: number,
    @Body() body: CriarSolicitacaoRequestDto,
  ): Promise<ResponseInterface<SolicitacaoDto>> {
    const solicitacao = await this.criarSolicitacaoService.execute({
      solicitanteId,
      dataCorrida: DateTime.fromISO(body.dataCorrida),
      tipoCorridaId: body.tipoCorridaId,
      tipoVeiculoId: body.tipoVeiculoId,
      motivoSolicitacaoId: body.motivoSolicitacaoId,
      origem: body.origem,
      destino: body.destino,
      paradas: body.paradas,
      centrosCustoIds: body.centrosCustoIds,
      cpfsAcompanhantes: body.cpfsAcompanhantes,
    });

    return { response: SolicitacaoDto.aPartirDoDominio(solicitacao) };
  }
}
