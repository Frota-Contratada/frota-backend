import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ResponseInterface } from '@common/interfaces/response-interface';
import { Perfis } from '@core/auth/decorators/perfis.decorator';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { BuscarPerfilService } from '../services/buscar-perfil.service';
import { MotoristaPerfilDto } from './dtos/response/motorista-perfil.dto';

@ApiTags('Motorista')
@ApiBearerAuth()
@Controller()
@Perfis(TipoPerfil.MOTORISTA)
export class BuscarPerfilController {
  constructor(private readonly buscarPerfilService: BuscarPerfilService) {}

  @Get('perfil')
  async buscarPerfil(
    @CurrentUser('id') motoristaId: number,
  ): Promise<ResponseInterface<MotoristaPerfilDto>> {
    const perfil = await this.buscarPerfilService.execute(motoristaId);
    return { response: new MotoristaPerfilDto(perfil) };
  }
}
