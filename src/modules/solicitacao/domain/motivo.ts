import { TipoMotivo } from '../enums/tipo-motivo.enum';

export class Motivo {
  constructor(
    public id: number,
    public nome: string,
    public tipo: TipoMotivo,
  ) {}
}
