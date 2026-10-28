import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { BuscarFilialService } from '../services/buscar-filial.service';
import { FilialDto } from './dtos/response/filial.dto';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';

@ApiTags('Filial')
@Controller()
export class BuscarFilialController {
  constructor(private readonly buscarFilialService: BuscarFilialService) {}

  @Get(':id')
  @Perfis(TipoPerfil.ADMIN_MASTER, TipoPerfil.ADMIN_FILIAL)
  async buscar(
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
    @Query(
      'empresaId',
      new ZodValidationPipe(z.coerce.number().int().positive()),
    )
    empresaId: number,
  ): Promise<ResponseInterface<FilialDto>> {
    const filial = await this.buscarFilialService.execute(empresaId, id);

    return {
      response: FilialDto.aPartirDoDominio(filial),
    };
  }
}
