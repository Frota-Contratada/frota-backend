import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DateTime } from 'luxon';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ApiRespostaPaginadaDe } from '@common/decorators/api-resposta.decorator';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { BuscarSolicitacoesParaAprovacaoService } from '../services/buscar-solicitacoes-para-aprovacao.service';
import { BuscarSolicitacoesAprovadorQueryDto } from './dtos/request/buscar-solicitacoes-aprovador-query.dto';
import { SolicitacaoDto } from './dtos/response/solicitacao.dto';

@ApiTags('Solicitação')
@ApiBearerAuth()
@Controller()
export class BuscarSolicitacoesAprovadorController {
  constructor(
    private readonly buscarSolicitacoesParaAprovacaoService: BuscarSolicitacoesParaAprovacaoService,
  ) {}

  @Get('aprovador/pendentes')
  @Perfis(TipoPerfil.APROVADOR)
  @ApiOperation({
    summary: 'Lista as solicitações pendentes do aprovador autenticado',
    description:
      'Retorna somente solicitações com rateio pendente atribuído ao usuário autenticado como aprovador.',
  })
  @ApiRespostaPaginadaDe(SolicitacaoDto)
  async handle(
    @CurrentUser('id') aprovadorId: number,
    @Query() query: BuscarSolicitacoesAprovadorQueryDto,
  ): Promise<ResponseInterface<PaginatedResponseInterface<SolicitacaoDto>>> {
    const resultado =
      await this.buscarSolicitacoesParaAprovacaoService.execute({
        aprovadorId,
        tipoCorridaId: query.tipoCorridaId,
        dataInicio: query.dataInicio
          ? DateTime.fromISO(query.dataInicio)
          : undefined,
        dataFim: query.dataFim ? DateTime.fromISO(query.dataFim) : undefined,
        ordenacao: query.ordenacao,
        page: query.page,
        limit: query.limit,
      });

    return {
      response: {
        totalCount: resultado.totalCount,
        hasNextPage: resultado.hasNextPage,
        data: resultado.data.map((solicitacao) =>
          SolicitacaoDto.aPartirDoDominio(solicitacao),
        ),
      },
    };
  }
}
