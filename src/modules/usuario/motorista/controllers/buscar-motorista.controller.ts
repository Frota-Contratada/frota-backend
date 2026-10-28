import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { PaginatedResponseInterface } from '@common/interfaces/paginated-response.interface';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { BuscarMotoristaService } from '../services/buscar-motorista.service';
import { BuscarVariosMotoristasService } from '../services/buscar-varios-motoristas.service';
import { BuscarMotoristasQueryDto } from './dtos/request/buscar-motoristas-query.dto';
import { MotoristaDto } from './dtos/response/motorista.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { fornecedorDoEscopo } from '../services/fornecedor-do-escopo';

@ApiTags('Motorista')
@Controller()
export class BuscarMotoristaController {
  constructor(
    private readonly buscarMotoristaService: BuscarMotoristaService,
    private readonly buscarVariosMotoristasService: BuscarVariosMotoristasService,
  ) {}

  @Get()
  @Perfis(
    TipoPerfil.ADMIN_MASTER,
    TipoPerfil.ADMIN_FILIAL,
    TipoPerfil.ADMIN_FORNECEDOR,
  )
  async buscarVarios(
    @CurrentUser() usuario: AuthenticatedUser,
    @Query() query: BuscarMotoristasQueryDto,
  ): Promise<ResponseInterface<PaginatedResponseInterface<MotoristaDto>>> {
    const resultado = await this.buscarVariosMotoristasService.execute({
      ...query,
      fornecedorId: fornecedorDoEscopo(usuario) ?? query.fornecedorId,
    });

    return {
      response: {
        totalCount: resultado.totalCount,
        hasNextPage: resultado.hasNextPage,
        data: resultado.data.map(
          (motorista) =>
            new MotoristaDto(
              motorista.id,
              motorista.nome,
              motorista.email,
              motorista.cpf,
              motorista.fornecedorId,
              motorista.telefone,
              motorista.dataAtivacao.toISO() ?? undefined,
            ),
        ),
      },
    };
  }

  @Get(':id')
  @Perfis(
    TipoPerfil.ADMIN_MASTER,
    TipoPerfil.ADMIN_FILIAL,
    TipoPerfil.ADMIN_FORNECEDOR,
  )
  async buscar(
    @CurrentUser() usuario: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
  ): Promise<ResponseInterface<MotoristaDto>> {
    const motorista = await this.buscarMotoristaService.execute(
      id,
      fornecedorDoEscopo(usuario),
    );

    return {
      response: new MotoristaDto(
        motorista.id,
        motorista.nome,
        motorista.email,
        motorista.cpf,
        motorista.fornecedorId,
        motorista.telefone,
        motorista.dataAtivacao.toISO() ?? undefined,
      ),
    };
  }
}
