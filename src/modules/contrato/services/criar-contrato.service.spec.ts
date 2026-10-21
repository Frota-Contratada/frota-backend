import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { UsuarioNaoPertenceAFilialException } from '@module/filial/exceptions/usuario-nao-pertence-a-filial.exception';
import { VinculoContrato } from '../domain/vinculo-contrato';
import { CriarContratoService } from './criar-contrato.service';

describe('CriarContratoService', () => {
  const arquivo = {
    buffer: Buffer.from('%PDF'),
    originalname: 'contrato.pdf',
    mimetype: 'application/pdf',
  };
  const input = {
    dataVigenciaInicio: new Date('2026-10-01'),
    empresaId: 30,
    filialId: 704,
    fornecedorId: 864,
    tipoCorridaIds: [1, 2, 1],
  };

  const criarService = () => {
    const contratoRepository = {
      criar: jest.fn().mockResolvedValue({ id: 9010 }),
    };
    const storageService = {
      salvar: jest.fn().mockResolvedValue({ chave: 'contratos/abc.pdf' }),
      remover: jest.fn(),
    };
    const service = new CriarContratoService(
      contratoRepository as never,
      storageService as never,
      { validar: jest.fn() } as never,
    );

    return { service, contratoRepository, storageService };
  };

  it('cria o contrato com o vínculo e os tipos de corrida sem repetição', async () => {
    const { service, contratoRepository } = criarService();

    await service.execute(
      {
        id: 2,
        perfis: [TipoPerfil.ADMIN_FILIAL],
        empresaId: 30,
        filialId: 704,
      },
      input,
      arquivo as never,
    );

    expect(contratoRepository.criar).toHaveBeenCalledWith(
      expect.objectContaining({ caminhoArquivo: 'contratos/abc.pdf' }),
      new VinculoContrato(30, 704, 864),
      [1, 2],
    );
  });

  it('impede o admin de filial de contratar para outra filial', async () => {
    const { service, storageService } = criarService();

    await expect(
      service.execute(
        {
          id: 2,
          perfis: [TipoPerfil.ADMIN_FILIAL],
          empresaId: 30,
          filialId: 1,
        },
        input,
        arquivo as never,
      ),
    ).rejects.toBeInstanceOf(UsuarioNaoPertenceAFilialException);
    expect(storageService.salvar).not.toHaveBeenCalled();
  });

  it('remove o arquivo salvo quando o cadastro falha', async () => {
    const { service, contratoRepository, storageService } = criarService();
    contratoRepository.criar.mockRejectedValueOnce(new Error('falha'));

    await expect(
      service.execute(
        { id: 1, perfis: [TipoPerfil.ADMIN_MASTER] },
        input,
        arquivo as never,
      ),
    ).rejects.toThrow('falha');
    expect(storageService.remover).toHaveBeenCalledWith('contratos/abc.pdf');
  });
});
