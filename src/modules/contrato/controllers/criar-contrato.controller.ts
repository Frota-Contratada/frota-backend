import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { ResponseInterface } from '@common/interfaces/response-interface';
import type { ArquivoRecebidoInterface } from '@core/storage/interfaces/arquivo-recebido.interface';
import { CriarContratoRequestDto } from './dtos/request/criar-contrato-request.dto';
import { ContratoDto } from './dtos/response/contrato.dto';
import { CriarContratoService } from '../services/criar-contrato.service';

@ApiTags('Contrato')
@ApiBearerAuth()
@Controller()
export class CriarContratoController {
  constructor(private readonly criarContratoService: CriarContratoService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CriarContratoRequestDto })
  @UseInterceptors(FileInterceptor('arquivo'))
  async handle(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() body: CriarContratoRequestDto,
    @UploadedFile() arquivo?: ArquivoRecebidoInterface,
  ): Promise<ResponseInterface<ContratoDto>> {
    const contrato = await this.criarContratoService.execute(
      currentUser.id,
      body.dataVigenciaInicio,
      body.dataVigenciaFim,
      arquivo,
    );

    return {
      response: new ContratoDto(contrato),
    };
  }
}
