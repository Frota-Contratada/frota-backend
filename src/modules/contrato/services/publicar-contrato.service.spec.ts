import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { ContratoNaoEncontradoException } from '../exceptions/contrato-nao-encontrado.exception';
import { PublicarContratoService } from './publicar-contrato.service';

describe('PublicarContratoService', () => {
  const usuario = {
    id: 2,
    perfis: [TipoPerfil.ADMIN_FILIAL],
    empresaId: 30,
    filialId: 704,
  };

  const criarService = (contrato: unknown) => {
    const contratoRepository = {
      buscar: jest.fn().mockResolvedValue(contrato),
      publicar: jest.fn().mockResolvedValue({ id: 9010 }),
    };
    const validarAcessoAoContrato = { execute: jest.fn() };
    const service = new PublicarContratoService(
      contratoRepository as never,
      validarAcessoAoContrato as never,
    );

    return { service, contratoRepository, validarAcessoAoContrato };
  };

  it('valida o acesso antes de publicar', async () => {
    const { service, contratoRepository, validarAcessoAoContrato } =
      criarService({ id: 9010 });

    await service.execute(9010, usuario);

    expect(validarAcessoAoContrato.execute).toHaveBeenCalledWith(9010, usuario);
    expect(contratoRepository.publicar).toHaveBeenCalledWith(9010);
  });

  it('não publica contrato inexistente', async () => {
    const { service, contratoRepository } = criarService(null);

    await expect(service.execute(9010, usuario)).rejects.toBeInstanceOf(
      ContratoNaoEncontradoException,
    );
    expect(contratoRepository.publicar).not.toHaveBeenCalled();
  });
});
