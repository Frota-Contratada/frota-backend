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
import { AtualizarFotoPerfilService } from '../services/atualizar-foto-perfil.service';
import type { FotoPerfilArquivo } from '../services/atualizar-foto-perfil.service';
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
  @ApiBody({
    schema: {
      type: 'object',
      required: ['foto'],
      properties: {
        foto: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('foto'))
  async handle(
    @CurrentUser() currentUser: AuthenticatedUser,
    @UploadedFile() arquivo?: FotoPerfilArquivo,
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
