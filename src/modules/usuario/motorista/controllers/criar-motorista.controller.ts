import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { CriarMotoristaRequestDto } from './dtos/request/criar-motorista-request.dto';
import { MotoristaDto } from './dtos/response/motorista.dto';
import { CriarMotoristaService } from '../services/criar-motorista.service';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { fornecedorDoEscopo } from '../services/fornecedor-do-escopo';

@ApiTags('Motorista')
@Controller()
export class CriarMotoristaController {
  constructor(private readonly criarMotoristaService: CriarMotoristaService) {}

  @Post('/motoristas')
  @Perfis(
    TipoPerfil.ADMIN_MASTER,
    TipoPerfil.ADMIN_FILIAL,
    TipoPerfil.ADMIN_FORNECEDOR,
  )
  async handle(
    @CurrentUser() usuario: AuthenticatedUser,
    @Body() body: CriarMotoristaRequestDto,
  ): Promise<ResponseInterface<MotoristaDto>> {
    // O admin de fornecedor sempre cadastra no próprio fornecedor, seja qual
    // for o fornecedorId enviado.
    const motorista = await this.criarMotoristaService.execute(
      body.nome,
      body.email,
      body.cpf,
      fornecedorDoEscopo(usuario) ?? body.fornecedorId,
      body.telefone,
    );

    const response = new MotoristaDto(
      motorista.id,
      motorista.nome,
      motorista.email,
      motorista.cpf,
      motorista.fornecedorId,
      motorista.telefone,
      motorista.dataAtivacao.toISO() ?? undefined,
    );

    return {
      response,
    };
  }
}
