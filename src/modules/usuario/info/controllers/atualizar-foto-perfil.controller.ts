import {
  Controller,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { Transacional } from '@core/prisma/decorators/transacional.decorator';
import type { ArquivoRecebidoInterface } from '@core/storage/interfaces/arquivo-recebido.interface';
import { AtualizarFotoPerfilService } from '../services/atualizar-foto-perfil.service';
import { AtualizarFotoPerfilRequestDto } from './dtos/request/atualizar-foto-perfil-request.dto';
import { UsuarioAtualDto } from './dtos/response/usuario-atual.dto';

@ApiTags('Usuário')
@ApiBearerAuth()
@Controller()
export class AtualizarFotoPerfilController {
  constructor(
    private readonly atualizarFotoPerfilService: AtualizarFotoPerfilService,
  ) {}

  @Patch('me/foto')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: AtualizarFotoPerfilRequestDto })
  @UseInterceptors(FileInterceptor('foto'))
  @Transacional()
  async handle(
    @CurrentUser() currentUser: AuthenticatedUser,
    @UploadedFile() arquivo?: ArquivoRecebidoInterface,
  ): Promise<ResponseInterface<UsuarioAtualDto>> {
    const usuario = await this.atualizarFotoPerfilService.execute(
      currentUser.id,
      arquivo,
    );

    return {
      response: new UsuarioAtualDto(usuario),
    };
  }
}
