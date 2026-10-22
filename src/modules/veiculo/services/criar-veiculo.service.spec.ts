import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { FornecedorDoVeiculoObrigatorioException } from '../exceptions/fornecedor-do-veiculo-obrigatorio.exception';
import { PlacaJaCadastradaException } from '../exceptions/placa-ja-cadastrada.exception';
import { CriarVeiculoService } from './criar-veiculo.service';

describe('CriarVeiculoService', () => {
  const criarService = (escopo: unknown, placaExiste = false) => {
    const veiculoRepository = {
      existePlaca: jest.fn().mockResolvedValue(placaExiste),
      criar: jest.fn((veiculo: unknown) => Promise.resolve(veiculo)),
    };
    const service = new CriarVeiculoService(
      veiculoRepository as never,
      { execute: jest.fn().mockResolvedValue(escopo) } as never,
    );

    return { service, veiculoRepository };
  };
  const usuario = { id: 3, perfis: [TipoPerfil.ADMIN_FORNECEDOR] };
  const input = { placa: 'ABC1D23', tipoVeiculoId: 2, modelo: 'Spin' };

  it('cadastra o veículo na frota resolvida', async () => {
    const { service, veiculoRepository } = criarService({ fornecedorId: 864 });

    await service.execute(usuario, input);

    expect(veiculoRepository.criar).toHaveBeenCalledWith(
      expect.objectContaining({
        fornecedorId: 864,
        placa: 'ABC1D23',
        tipoVeiculoId: 2,
        modelo: 'Spin',
      }),
    );
  });

  it('recusa placa já cadastrada', async () => {
    const { service } = criarService({ fornecedorId: 864 }, true);

    await expect(service.execute(usuario, input)).rejects.toBeInstanceOf(
      PlacaJaCadastradaException,
    );
  });

  it('exige o fornecedor quando o usuário não tem frota própria', async () => {
    const { service } = criarService({
      filial: { empresaId: 30, filialId: 704 },
    });

    await expect(service.execute(usuario, input)).rejects.toBeInstanceOf(
      FornecedorDoVeiculoObrigatorioException,
    );
  });
});
