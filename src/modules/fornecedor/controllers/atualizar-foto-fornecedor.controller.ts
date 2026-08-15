import {
  Controller,
  Param,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { Transacional } from '@core/prisma/decorators/transacional.decorator';
import type { ArquivoRecebidoInterface } from '@core/storage/interfaces/arquivo-recebido.interface';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { ZodValidationPipe } from 'nestjs-zod';
import z from 'zod';
import { AtualizarFotoFornecedorService } from '../services/atualizar-foto-fornecedor.service';
import { AtualizarFotoFornecedorRequestDto } from './dtos/request/atualizar-foto-fornecedor-request.dto';
import { FornecedorDto } from './dtos/response/fornecedor.dto';

@ApiTags('Fornecedor')
@ApiBearerAuth()
@Controller()
export class AtualizarFotoFornecedorController {
  constructor(
    private readonly atualizarFotoFornecedorService: AtualizarFotoFornecedorService,
  ) {}

  @Patch(':id/foto')
  @Perfis(TipoPerfil.ADMIN_MASTER, TipoPerfil.ADMIN_FILIAL)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: AtualizarFotoFornecedorRequestDto })
  @UseInterceptors(FileInterceptor('foto'))
  @Transacional()
  async handle(
    @Param('id', new ZodValidationPipe(z.coerce.number().int().positive()))
    id: number,
    @UploadedFile() arquivo?: ArquivoRecebidoInterface,
  ): Promise<ResponseInterface<FornecedorDto>> {
    const fornecedor = await this.atualizarFotoFornecedorService.execute(
      id,
      arquivo,
    );

    return {
      response: new FornecedorDto(
        fornecedor.id,
        fornecedor.nome,
        fornecedor.cnpjCpf,
        fornecedor.foto,
      ),
    };
  }
}
