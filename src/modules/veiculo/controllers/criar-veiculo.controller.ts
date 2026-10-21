import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiRespostaDe } from '@common/decorators/api-resposta.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { CriarVeiculoService } from '../services/criar-veiculo.service';
import { CriarVeiculoRequestDto } from './dtos/request/criar-veiculo-request.dto';
import { VeiculoDto } from './dtos/response/veiculo.dto';

@ApiTags('Veículo')
@ApiBearerAuth()
@Controller()
export class CriarVeiculoController {
  constructor(private readonly criarVeiculoService: CriarVeiculoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Perfis(TipoPerfil.ADMIN_FORNECEDOR, TipoPerfil.ADMIN_FILIAL)
  @ApiRespostaDe(VeiculoDto, { status: HttpStatus.CREATED })
  async handle(
    @CurrentUser() usuario: AuthenticatedUser,
    @Body() body: CriarVeiculoRequestDto,
  ): Promise<ResponseInterface<VeiculoDto>> {
    const veiculo = await this.criarVeiculoService.execute(usuario, {
      placa: body.placa,
      tipoVeiculoId: body.tipoVeiculoId,
      modelo: body.modelo,
      fornecedorId: body.fornecedorId,
    });

    return { response: VeiculoDto.aPartirDoDominio(veiculo) };
  }
}
