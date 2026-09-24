import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { BuscarCorridasService } from '../services/buscar-corridas.service';
import { CancelarCorridaService } from '../services/cancelar-corrida.service';
import { BuscarCorridasQueryDto } from './dtos/request/buscar-corridas-query.dto';
import { CancelarCorridaRequestDto } from './dtos/request/cancelar-corrida-request.dto';
import { CorridaDto } from './dtos/response/corrida.dto';

const PERFIS_CONSULTA = [
  TipoPerfil.SOLICITANTE,
  TipoPerfil.SOLICITANTE_EMERGENCIA,
  TipoPerfil.MOTORISTA,
  TipoPerfil.ADMIN_FORNECEDOR,
  TipoPerfil.APROVADOR,
  TipoPerfil.ADMIN_FILIAL,
  TipoPerfil.ADMIN_MASTER,
];

@ApiTags('Corrida')
@ApiBearerAuth()
@Controller('corridas')
export class CorridaController {
  constructor(
    private readonly buscarCorridasService: BuscarCorridasService,
    private readonly cancelarCorridaService: CancelarCorridaService,
  ) {}

  @Get('minhas')
  @Perfis(...PERFIS_CONSULTA)
  async listar(
    @CurrentUser() usuario: AuthenticatedUser,
    @Query() query: BuscarCorridasQueryDto,
  ): Promise<ResponseInterface<CorridaDto[]>> {
    return {
      response: await this.buscarCorridasService.listar(usuario, {
        status: query.status,
        dataInicio: query.dataInicio ? new Date(query.dataInicio) : undefined,
        dataFim: query.dataFim ? new Date(query.dataFim) : undefined,
      }),
    };
  }

  @Get(':id')
  @Perfis(...PERFIS_CONSULTA)
  async buscar(
    @CurrentUser() usuario: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
  ): Promise<ResponseInterface<CorridaDto>> {
    return {
      response: await this.buscarCorridasService.buscar(id, usuario),
    };
  }

  @Patch(':id/cancelamento')
  @Perfis(
    TipoPerfil.SOLICITANTE,
    TipoPerfil.SOLICITANTE_EMERGENCIA,
    TipoPerfil.MOTORISTA,
  )
  async cancelar(
    @CurrentUser() usuario: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
    @Body() body: CancelarCorridaRequestDto,
  ): Promise<ResponseInterface<CorridaDto>> {
    return {
      response: await this.cancelarCorridaService.execute(
        id,
        usuario,
        body.motivoCancelamentoId,
      ),
    };
  }
}
