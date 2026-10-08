import { AtualizarFornecedorService } from './atualizar-fornecedor.service';

describe('AtualizarFornecedorService nullable tax ID', () => {
  const fornecedorAtual = {
    id: 9,
    nome: 'Fornecedor',
    cnpjCpf: '12345678901234',
  };

  it('preserves an existing tax ID when the field is omitted', async () => {
    const repository = {
      buscar: jest.fn().mockResolvedValue(fornecedorAtual),
      atualizar: jest.fn().mockResolvedValue(fornecedorAtual),
      existePorCnpjCpf: jest.fn(),
      existeOutroComNomeNasFiliaisDoFornecedor: jest.fn(),
    };
    const service = new AtualizarFornecedorService(
      repository as never,
      {} as never,
    );

    await service.execute(9, 'Fornecedor', undefined);

    expect(repository.atualizar).toHaveBeenCalledWith(
      9,
      'Fornecedor',
      '12345678901234',
    );
    expect(repository.existePorCnpjCpf).not.toHaveBeenCalled();
  });

  it('allows explicit null to clear the tax ID', async () => {
    const repository = {
      buscar: jest.fn().mockResolvedValue(fornecedorAtual),
      atualizar: jest
        .fn()
        .mockResolvedValue({ ...fornecedorAtual, cnpjCpf: null }),
      existePorCnpjCpf: jest.fn(),
      existeOutroComNomeNasFiliaisDoFornecedor: jest.fn(),
    };
    const service = new AtualizarFornecedorService(
      repository as never,
      {} as never,
    );

    await service.execute(9, 'Fornecedor', null);

    expect(repository.atualizar).toHaveBeenCalledWith(9, 'Fornecedor', null);
    expect(repository.existePorCnpjCpf).not.toHaveBeenCalled();
  });
});
