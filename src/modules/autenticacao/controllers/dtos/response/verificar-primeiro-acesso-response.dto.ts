export class VerificarPrimeiroAcessoResponseDto {
  constructor(primeiroAcesso: boolean) {
    this.primeiroAcesso = primeiroAcesso;
  }
  primeiroAcesso: boolean;
}
