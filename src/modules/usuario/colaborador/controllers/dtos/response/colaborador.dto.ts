import { UsuarioPerfilDto } from '@module/usuario/info/controllers/dtos/response/usuario-perfil.dto';
import { Colaborador } from '../../../domain/colaborador';

export class ColaboradorDto {
  id: number;
  nome: string;
  email: string;
  cargo?: string;
  filialId?: number;
  centroCustoId?: number;
  perfis: UsuarioPerfilDto[];

  constructor(colaborador: Colaborador) {
    this.id = colaborador.id;
    this.nome = colaborador.nome;
    this.email = colaborador.email;
    this.cargo = colaborador.cargo;
    this.filialId = colaborador.filialId;
    this.centroCustoId = colaborador.centroCustoId;
    this.perfis = colaborador.perfis.map(
      (perfil) => new UsuarioPerfilDto(perfil),
    );
  }
}
