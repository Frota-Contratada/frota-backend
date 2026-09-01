import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DateTime } from 'luxon';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import {
  ApiRespostaDe,
  ApiRespostaPaginadaDe,
} from '@common/decorators/api-resposta.decorator';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { BuscarSolicitacaoService } from '../services/buscar-solicitacao.service';
import { BuscarVariasSolicitacoesService } from '../services/buscar-varias-solicitacoes.service';
import { BuscarSolicitacoesQueryDto } from './dtos/request/buscar-solicitacoes-query.dto';
import { SolicitacaoDto } from './dtos/response/solicitacao.dto';

@ApiTags('Solicitação')
@ApiBearerAuth()
@Controller()
export class BuscarSolicitacaoController {
  constructor(
    private readonly buscarSolicitacaoService: BuscarSolicitacaoService,
    private readonly buscarVariasSolicitacoesService: BuscarVariasSolicitacoesService,
  ) {}

  @Get()
  @Perfis(TipoPerfil.SOLICITANTE, TipoPerfil.SOLICITANTE_EMERGENCIA)
  @ApiOperation({
    summary: 'Lista as solicitações do solicitante autenticado',
    description:
      'Filtra por status, modalidade e período da corrida, com ordenação da mais recente para a mais antiga por padrão.',
  })
  @ApiRespostaPaginadaDe(SolicitacaoDto)
  async buscarVarias(
    @CurrentUser('id') solicitanteId: number,
    @Query() query: BuscarSolicitacoesQueryDto,
  ): Promise<ResponseInterface<PaginatedResponseInterface<SolicitacaoDto>>> {
    const resultado = await this.buscarVariasSolicitacoesService.execute({
      solicitanteId,
      status: query.status,
      tipoCorridaId: query.tipoCorridaId,
      dataInicio: query.dataInicio
        ? DateTime.fromISO(query.dataInicio)
        : undefined,
      dataFim: query.dataFim ? DateTime.fromISO(query.dataFim) : undefined,
      historico: query.historico === 'true',
      incluirAnteriores: query.incluirAnteriores === 'true',
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

  @Get(':id')
  @Perfis(TipoPerfil.SOLICITANTE, TipoPerfil.SOLICITANTE_EMERGENCIA)
  @ApiOperation({
    summary: 'Detalha uma solicitação',
    description:
      'Inclui trajeto, rateios com status de aprovação, passageiros e, quando já houve atribuição, os dados da corrida.',
  })
  @ApiRespostaDe(SolicitacaoDto)
  async buscar(
    @CurrentUser('id') solicitanteId: number,
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
  ): Promise<ResponseInterface<SolicitacaoDto>> {
    const solicitacao = await this.buscarSolicitacaoService.execute(
      id,
      solicitanteId,
    );

    return { response: SolicitacaoDto.aPartirDoDominio(solicitacao) };
  }
}
