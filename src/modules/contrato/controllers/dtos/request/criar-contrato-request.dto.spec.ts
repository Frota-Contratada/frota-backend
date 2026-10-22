import { CriarContratoRequestSchema } from './criar-contrato-request.dto';

describe('CriarContratoRequestSchema', () => {
  const corpo = {
    dataVigenciaInicio: '2026-10-01',
    empresaId: '30',
    filialId: '704',
    fornecedorId: '864',
  };

  it('converte os campos do formulário multipart', () => {
    const resultado = CriarContratoRequestSchema.parse({
      ...corpo,
      tipoCorridaIds: '1,2',
    });

    expect(resultado).toMatchObject({
      empresaId: 30,
      filialId: 704,
      fornecedorId: 864,
      tipoCorridaIds: [1, 2],
    });
  });

  it('aceita tipos de corrida enviados como campos repetidos', () => {
    expect(
      CriarContratoRequestSchema.parse({ ...corpo, tipoCorridaIds: ['3'] })
        .tipoCorridaIds,
    ).toEqual([3]);
  });

  it('exige fornecedor e ao menos um tipo de corrida', () => {
    expect(
      CriarContratoRequestSchema.safeParse({
        ...corpo,
        fornecedorId: undefined,
        tipoCorridaIds: '',
      }).success,
    ).toBe(false);
  });
});
