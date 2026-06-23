import { TipoToken } from '../enums/tipo-token.enum';

export class Pin {
  constructor(
    public readonly id: number,
    public readonly usuarioId: number,
    public readonly tipoToken: TipoToken,
    public readonly pin: string,
    public readonly token: string | null,
    public readonly utilizado: boolean,
    public readonly dataCriacao: Date,
    public readonly dataExpiracao: Date,
    public readonly dataUtilizado: Date | null,
  ) {}

  expirado(): boolean {
    return this.dataExpiracao.getTime() <= Date.now();
  }
}
