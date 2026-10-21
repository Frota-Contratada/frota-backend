import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { VinculoContrato } from '../domain/vinculo-contrato';
import { AcessoAoContratoNegadoException } from '../exceptions/acesso-ao-contrato-negado.exception';
import { ValidarAcessoAoContratoService } from './validar-acesso-ao-contrato.service';

describe('ValidarAcessoAoContratoService', () => {
  const contratoRepository = {
    buscarVinculos: jest
      .fn()
      .mockResolvedValue([new VinculoContrato(30, 704, 864)]),
  };
  const service = new ValidarAcessoAoContratoService(
    contratoRepository as never,
  );

  it.each([
    ['admin master', { id: 1, perfis: [TipoPerfil.ADMIN_MASTER] }],
    [
      'admin da filial vinculada',
      {
        id: 2,
        perfis: [TipoPerfil.ADMIN_FILIAL],
        empresaId: 30,
        filialId: 704,
      },
    ],
    [
      'admin do fornecedor vinculado',
      { id: 3, perfis: [TipoPerfil.ADMIN_FORNECEDOR], fornecedorId: 864 },
    ],
  ])('libera o acesso para %s', async (_descricao, usuario) => {
    await expect(service.execute(9001, usuario)).resolves.toBeUndefined();
  });

  it.each([
    [
      'admin de outra filial',
      { id: 2, perfis: [TipoPerfil.ADMIN_FILIAL], empresaId: 30, filialId: 1 },
    ],
    [
      'admin de outro fornecedor',
      { id: 3, perfis: [TipoPerfil.ADMIN_FORNECEDOR], fornecedorId: 6796 },
    ],
    [
      'aprovador da filial vinculada',
      { id: 4, perfis: [TipoPerfil.APROVADOR], empresaId: 30, filialId: 704 },
    ],
  ])('nega o acesso para %s', async (_descricao, usuario) => {
    await expect(service.execute(9001, usuario)).rejects.toBeInstanceOf(
      AcessoAoContratoNegadoException,
    );
  });
});
