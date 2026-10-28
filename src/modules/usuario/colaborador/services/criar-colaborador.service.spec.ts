import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { CentroCustoNaoEncontradoException } from '@module/centro-de-custo/exceptions/centro-custo-nao-encontrado.exception';
import { CpfJaCadastradoException } from '@module/usuario/motorista/exceptions/cpf-ja-cadastrado.exception';
import { EmailJaCadastradoException } from '@module/usuario/motorista/exceptions/email-ja-cadastrado.exception';
import { CriarColaboradorService } from './criar-colaborador.service';

const dados = {
  nome: 'Visitante da Feira',
  email: 'visitante@exemplo.com',
  cargo: 'Analista',
  empresaId: 30,
  filialId: 704,
  centroCustoId: 4704,
  perfis: [TipoPerfil.SOLICITANTE],
};

function montar(opcoes: { emailExiste?: boolean; cpfExiste?: boolean } = {}) {
  const ordem: string[] = [];
  const colaboradorRepository = {
    criar: jest.fn().mockResolvedValue(9200),
    buscar: jest.fn().mockResolvedValue({ id: 9200 }),
  };
  const usuarioRepository = {
    buscarPorEmail: jest
      .fn()
      .mockResolvedValue(opcoes.emailExiste ? { id: 1 } : null),
    buscarPorCpf: jest
      .fn()
      .mockResolvedValue(opcoes.cpfExiste ? { id: 1 } : null),
  };
  const centroCustoRepository = {
    buscar: jest.fn().mockResolvedValue({ empresaId: 30, filialId: 704 }),
  };
  const perfil = (nome: string) => ({
    execute: jest.fn().mockImplementation(() => {
      ordem.push(nome);
      return Promise.resolve();
    }),
  });
  const aprovador = perfil('aprovador');
  const solicitante = perfil('solicitante');
  const emergencia = perfil('emergencia');

  const service = new CriarColaboradorService(
    colaboradorRepository as never,
    usuarioRepository as never,
    centroCustoRepository as never,
    aprovador as never,
    solicitante as never,
    emergencia as never,
  );

  return {
    service,
    colaboradorRepository,
    centroCustoRepository,
    aprovador,
    solicitante,
    emergencia,
    ordem,
  };
}

describe('CriarColaboradorService', () => {
  it('grava o colaborador sem senha e concede os perfis pedidos', async () => {
    const { service, colaboradorRepository, solicitante, aprovador } = montar();

    await service.execute(dados);

    expect(colaboradorRepository.criar).toHaveBeenCalledWith({
      nome: 'Visitante da Feira',
      email: 'visitante@exemplo.com',
      cpf: undefined,
      cargo: 'Analista',
      empresaId: 30,
      filialId: 704,
    });
    expect(solicitante.execute).toHaveBeenCalledWith({
      colaboradorId: 9200,
      empresaId: 30,
      filialId: 704,
      centroCustoId: 4704,
    });
    expect(aprovador.execute).not.toHaveBeenCalled();
  });

  it('concede aprovador antes de solicitante e emergência por último', async () => {
    const { service, ordem } = montar();

    await service.execute({
      ...dados,
      perfis: [
        TipoPerfil.SOLICITANTE_EMERGENCIA,
        TipoPerfil.SOLICITANTE,
        TipoPerfil.APROVADOR,
      ],
    });

    expect(ordem).toEqual(['aprovador', 'solicitante', 'emergencia']);
  });

  it('recusa e-mail já cadastrado sem gravar nada', async () => {
    const { service, colaboradorRepository } = montar({ emailExiste: true });

    await expect(service.execute(dados)).rejects.toBeInstanceOf(
      EmailJaCadastradoException,
    );
    expect(colaboradorRepository.criar).not.toHaveBeenCalled();
  });

  it('recusa CPF já cadastrado sem gravar nada', async () => {
    const { service, colaboradorRepository } = montar({ cpfExiste: true });

    await expect(
      service.execute({ ...dados, cpf: '52998224725' }),
    ).rejects.toBeInstanceOf(CpfJaCadastradoException);
    expect(colaboradorRepository.criar).not.toHaveBeenCalled();
  });

  it('recusa centro de custo inexistente na filial sem gravar nada', async () => {
    const { service, colaboradorRepository, centroCustoRepository } = montar();
    centroCustoRepository.buscar.mockResolvedValue(null);

    await expect(service.execute(dados)).rejects.toBeInstanceOf(
      CentroCustoNaoEncontradoException,
    );
    expect(colaboradorRepository.criar).not.toHaveBeenCalled();
  });
});
