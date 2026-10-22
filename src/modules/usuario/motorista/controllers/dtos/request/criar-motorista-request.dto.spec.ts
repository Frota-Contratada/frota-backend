import { CriarMotoristaRequestSchema } from './criar-motorista-request.dto';

describe('CriarMotoristaRequestSchema', () => {
  const corpo = {
    nome: 'Motorista Novo',
    email: 'novo@frota.com.br',
    cpf: '12345678901',
    fornecedorId: 864,
  };

  it('guarda somente os dígitos do telefone', () => {
    expect(
      CriarMotoristaRequestSchema.parse({
        ...corpo,
        telefone: '(43) 99999-0000',
      }).telefone,
    ).toBe('43999990000');
  });

  it('aceita cadastro sem telefone', () => {
    expect(CriarMotoristaRequestSchema.safeParse(corpo).success).toBe(true);
  });

  it('recusa telefone sem DDD', () => {
    expect(
      CriarMotoristaRequestSchema.safeParse({
        ...corpo,
        telefone: '99999-000',
      }).success,
    ).toBe(false);
  });
});
