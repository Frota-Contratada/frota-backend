import { TIPO_REGRA_ID, TipoRegra } from '../../contrato/enums/tipo-regra.enum';
import { calcularValorPorRegras } from './calculo-valor-regras';

const KM = TIPO_REGRA_ID[TipoRegra.VALOR_KM];
const FIXO = TIPO_REGRA_ID[TipoRegra.VALOR_FIXO];
const PERCENTUAL = TIPO_REGRA_ID[TipoRegra.PERCENTUAL];

describe('calcularValorPorRegras', () => {
  it('cobra somente a primeira regra de valor por prioridade', () => {
    const resultado = calcularValorPorRegras(
      [
        { id: 2, prioridade: 2, tipoRegraId: FIXO, valorFixo: 80 },
        { id: 1, prioridade: 1, tipoRegraId: KM, valorKm: 2.5 },
      ],
      10,
    );

    expect(resultado).toEqual({
      valor: 25,
      regrasAplicadas: [{ regraId: 1, valorCobrado: 25 }],
    });
  });

  it('aplica percentuais sobre a base sem acumulá-los entre si', () => {
    const resultado = calcularValorPorRegras(
      [
        { id: 1, prioridade: 1, tipoRegraId: PERCENTUAL, percentual: 10 },
        { id: 2, prioridade: 2, tipoRegraId: FIXO, valorFixo: 100 },
        { id: 3, prioridade: 3, tipoRegraId: PERCENTUAL, percentual: 20 },
      ],
      5,
    );

    expect(resultado).toEqual({
      valor: 130,
      regrasAplicadas: [
        { regraId: 2, valorCobrado: 100 },
        { regraId: 1, valorCobrado: 10 },
        { regraId: 3, valorCobrado: 20 },
      ],
    });
  });

  it('não precifica quando só há regras percentuais', () => {
    expect(
      calcularValorPorRegras(
        [{ id: 1, prioridade: 1, tipoRegraId: PERCENTUAL, percentual: 30 }],
        10,
      ),
    ).toBeUndefined();
  });

  it('não precifica sem regras', () => {
    expect(calcularValorPorRegras([], 10)).toBeUndefined();
  });

  it('arredonda para centavos', () => {
    expect(
      calcularValorPorRegras(
        [{ id: 1, prioridade: 1, tipoRegraId: KM, valorKm: 1.333 }],
        3,
      )?.valor,
    ).toBe(4);
  });

  it('trata regra sem tipo informado como regra de valor', () => {
    expect(
      calcularValorPorRegras(
        [{ id: 1, prioridade: 1, valorKm: 2, percentual: 0, valorFixo: 0 }],
        7,
      )?.valor,
    ).toBe(14);
  });
});
