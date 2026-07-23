import { TipoToken } from '../../enums/tipo-token.enum';
import { Pin } from '../../domain/pin';

export abstract class PinRepositoryContract {
  abstract criar(
    usuarioId: number,
    tipoToken: TipoToken,
    pin: string,
  ): Promise<Pin>;

  abstract encontrarPinAtivo(
    usuarioId: number,
    tipoToken: TipoToken,
    pin: string,
  ): Promise<Pin | null>;

  abstract definirToken(id: number, token: string): Promise<Pin>;

  abstract encontrarTokenAtivo(
    token: string,
    tipoToken: TipoToken,
  ): Promise<Pin | null>;

  abstract marcarComoUtilizado(id: number): Promise<void>;

  abstract invalidarAnteriores(
    usuarioId: number,
    tipoToken: TipoToken,
  ): Promise<void>;
}
