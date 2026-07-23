export class ConfirmarPinResponseDto {
  constructor(token: string) {
    this.token = token;
  }

  token: string;
}
