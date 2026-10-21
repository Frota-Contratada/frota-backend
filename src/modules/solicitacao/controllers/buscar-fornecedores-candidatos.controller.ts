import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ApiRespostaListaDe } from '@common/decorators/api-resposta.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { BuscarFornecedoresCandidatosService } from '../services/buscar-fornecedores-candidatos.service';
import { FornecedorCandidatoDto } from './dtos/response/fornecedor-candidato.dto';

@ApiTags('Solicitação')
@ApiBearerAuth()
@Controller()
export class BuscarFornecedoresCandidatosController {
  constructor(private readonly service: BuscarFornecedoresCandidatosService) {}

  @Get(':id/fornecedores-candidatos')
  @Perfis(TipoPerfil.APROVADOR)
  @ApiRespostaListaDe(FornecedorCandidatoDto)
  async handle(
    @CurrentUser('id') aprovadorId: number,
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
  ): Promise<ResponseInterface<FornecedorCandidatoDto[]>> {
    const candidatos = await this.service.execute(id, aprovadorId);

    return {
      response: candidatos.map((candidato) =>
        FornecedorCandidatoDto.aPartirDoDominio(candidato),
      ),
    };
  }
}
