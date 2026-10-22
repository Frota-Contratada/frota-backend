import { CriarVeiculoRequestSchema } from './criar-veiculo-request.dto';

describe('CriarVeiculoRequestSchema', () => {
  it.each([
    ['abc-1d23', 'ABC1D23'],
    ['ABC 1234', 'ABC1234'],
  ])('normaliza a placa %s', (placa, esperada) => {
    expect(
      CriarVeiculoRequestSchema.parse({ placa, tipoVeiculoId: 1 }).placa,
    ).toBe(esperada);
  });

  it('recusa placa fora do padrão', () => {
    expect(
      CriarVeiculoRequestSchema.safeParse({
        placa: 'AB12345',
        tipoVeiculoId: 1,
      }).success,
    ).toBe(false);
  });
});
