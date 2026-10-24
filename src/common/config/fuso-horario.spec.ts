import { FUSO_HORARIO_PADRAO, fusoHorarioOperacao } from './fuso-horario';

describe('fusoHorarioOperacao', () => {
  it('usa o horário de Brasília quando FUSO_HORARIO não está configurado', () => {
    expect(fusoHorarioOperacao('')).toBe(FUSO_HORARIO_PADRAO);
    expect(fusoHorarioOperacao(undefined)).toBe(FUSO_HORARIO_PADRAO);
  });

  it('respeita o fuso configurado', () => {
    expect(fusoHorarioOperacao(' America/Manaus ')).toBe('America/Manaus');
  });
});
