import { UsuarioPerfilDto } from '@module/usuario/info/controllers/dtos/response/usuario-perfil.dto';
import { Colaborador } from '../../../domain/colaborador';

export class PerfisDoColaboradorDto {
  id: number;
  filialId?: number;
  centroCustoId?: number;
  perfis: UsuarioPerfilDto[];

  constructor(colaborador: Colaborador) {
    this.id = colaborador.id;
    this.filialId = colaborador.filialId;
    this.centroCustoId = colaborador.centroCustoId;
    this.perfis = colaborador.perfis.map(
      (perfil) => new UsuarioPerfilDto(perfil),
    );
  }
}
