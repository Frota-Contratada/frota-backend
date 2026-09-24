import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ApiRespostaDe } from '@common/decorators/api-resposta.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { TipoVinculo } from '@module/autenticacao/enums/tipo-vinculo.enum';
import { VinculoDoUsuarioAusenteException } from '@module/autenticacao/exceptions/vinculo-do-usuario-ausente.exception';
import { AtualizarFornecedorService } from '../services/atualizar-fornecedor.service';
import { AtualizarFornecedorRequestDto } from './dtos/request/atualizar-fornecedor-request.dto';
import { FornecedorDto } from './dtos/response/fornecedor.dto';

@ApiTags('Fornecedor')
@ApiBearerAuth()
@Controller()
export class AtualizarFornecedorController {
  constructor(
    private readonly atualizarFornecedorService: AtualizarFornecedorService,
  ) {}

  @Patch('me')
  @Perfis(TipoPerfil.ADMIN_FORNECEDOR)
  @ApiRespostaDe(FornecedorDto)
  async atualizarProprio(
    @CurrentUser('fornecedorId') fornecedorId: number | undefined,
    @Body() body: AtualizarFornecedorRequestDto,
  ): Promise<ResponseInterface<FornecedorDto>> {
    if (!fornecedorId) {
      throw new VinculoDoUsuarioAusenteException(TipoVinculo.FORNECEDOR);
    }

    return this.atualizar(fornecedorId, body);
  }

  @Patch('admin/:id')
  @Perfis(TipoPerfil.ADMIN_MASTER)
  @ApiRespostaDe(FornecedorDto)
  async atualizarComoAdmin(
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
    @Body() body: AtualizarFornecedorRequestDto,
  ): Promise<ResponseInterface<FornecedorDto>> {
    return this.atualizar(id, body);
  }

  @Patch('filial/:id')
  @Perfis(TipoPerfil.ADMIN_FILIAL)
  @ApiRespostaDe(FornecedorDto)
  async atualizarDaFilial(
    @CurrentUser('filialId') filialId: number | undefined,
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
    @Body() body: AtualizarFornecedorRequestDto,
  ): Promise<ResponseInterface<FornecedorDto>> {
    if (!filialId) {
      throw new VinculoDoUsuarioAusenteException(TipoVinculo.FILIAL);
    }

    return this.atualizar(id, body, filialId);
  }

  private async atualizar(
    id: number,
    body: AtualizarFornecedorRequestDto,
    filialId?: number,
  ): Promise<ResponseInterface<FornecedorDto>> {
    const fornecedor = await this.atualizarFornecedorService.execute(
      id,
      body.nome,
      body.cnpjCpf,
      filialId,
    );

    return {
      response: new FornecedorDto(
        fornecedor.id,
        fornecedor.nome,
        fornecedor.cnpjCpf,
      ),
    };
  }
}
