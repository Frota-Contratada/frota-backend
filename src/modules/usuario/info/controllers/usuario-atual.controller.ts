import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import type { AuthenticatedUser } from '@core/auth/types/authenticated-user';
import { UsuarioAtualService } from '../services/usuario-atual.service';
import { UsuarioAtualDto } from './dtos/response/usuario-atual.dto';

@ApiTags('Usuário')
@ApiBearerAuth()
@Controller()
export class UsuarioAtualController {
  constructor(private readonly usuarioAtualService: UsuarioAtualService) {}

  @Get('me')
  async handle(
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<ResponseInterface<UsuarioAtualDto>> {
    const usuario = await this.usuarioAtualService.execute(currentUser.id);

    return {
      response: new UsuarioAtualDto(usuario),
    };
  }
}
