import { TipoRegra } from '../../../enums/tipo-regra.enum';
import { SubstituirRegrasRequestSchema } from './substituir-regras-request.dto';

describe('SubstituirRegrasRequestSchema', () => {
  it('aceita regra sem condição', () => {
    const resultado = SubstituirRegrasRequestSchema.safeParse({
      regras: [{ prioridade: 1, tipo: TipoRegra.VALOR_KM, valorKm: 3 }],
    });

    expect(resultado.success).toBe(true);
  });

  it('completa critérios omitidos da condição com listas vazias', () => {
    const resultado = SubstituirRegrasRequestSchema.parse({
      regras: [
        {
          prioridade: 1,
          tipo: TipoRegra.VALOR_FIXO,
          valorFixo: 30,
          condicao: { periodos: ['NOTURNO'] },
        },
      ],
    });

    expect(resultado.regras[0].condicao).toEqual({
      diasSemana: [],
      periodos: ['NOTURNO'],
      rotasFixas: [],
      tipoVeiculoIds: [],
      tipoCorridaIds: [],
    });
  });

  it('aceita bandeirada na regra de km', () => {
    const resultado = SubstituirRegrasRequestSchema.safeParse({
      regras: [
        { prioridade: 1, tipo: TipoRegra.VALOR_KM, valorKm: 3, valorFixo: 8.5 },
      ],
    });

    expect(resultado.success).toBe(true);
  });

  it('continua recusando valor por km em regra de valor fixo', () => {
    const resultado = SubstituirRegrasRequestSchema.safeParse({
      regras: [
        {
          prioridade: 1,
          tipo: TipoRegra.VALOR_FIXO,
          valorFixo: 30,
          valorKm: 2,
        },
      ],
    });

    expect(resultado.success).toBe(false);
  });
});
