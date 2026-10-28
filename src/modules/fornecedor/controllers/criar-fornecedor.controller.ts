import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { CriarFornecedorRequestDto } from './dtos/request/criar-fornecedor-request.dto';
import { FornecedorDto } from './dtos/response/fornecedor.dto';
import { CriarFornecedorService } from '../services/criar-fornecedor.service';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';

@ApiTags('Fornecedor')
@Controller()
export class CriarFornecedorController {
  constructor(
    private readonly criarFornecedorService: CriarFornecedorService,
  ) {}

  @Post()
  @Perfis(TipoPerfil.ADMIN_MASTER)
  async handle(
    @Body() body: CriarFornecedorRequestDto,
  ): Promise<ResponseInterface<FornecedorDto>> {
    const fornecedor = await this.criarFornecedorService.execute(
      body.nome,
      body.cnpjCpf ?? null,
      body.empresaId,
      body.filialId,
    );

    const response = new FornecedorDto(
      fornecedor.id,
      fornecedor.nome,
      fornecedor.cnpjCpf,
    );

    return {
      response,
    };
  }
}
