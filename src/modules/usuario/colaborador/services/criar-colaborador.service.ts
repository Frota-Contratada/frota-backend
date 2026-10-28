import { Injectable } from '@nestjs/common';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';
import { CentroCustoNaoEncontradoException } from '@module/centro-de-custo/exceptions/centro-custo-nao-encontrado.exception';
import { CentroCustoRepositoryContract } from '@module/centro-de-custo/repositories/centro-custo-repository.contract';
import { UsuarioRepositoryContract } from '@module/usuario/info/repositories/usuario-repository.contract';
import { CpfJaCadastradoException } from '@module/usuario/motorista/exceptions/cpf-ja-cadastrado.exception';
import { EmailJaCadastradoException } from '@module/usuario/motorista/exceptions/email-ja-cadastrado.exception';
import { Colaborador } from '../domain/colaborador';
import { ColaboradorNaoEncontradoException } from '../exceptions/colaborador-nao-encontrado.exception';
import { ColaboradorRepositoryContract } from '../repositories/colaborador-repository.contract';
import { TornarAprovadorService } from './tornar-aprovador.service';
import { TornarSolicitanteService } from './tornar-solicitante.service';
import { TornarSolicitanteEmergenciaService } from './tornar-solicitante-emergencia.service';

/**
 * Cadastra o colaborador sem senha: ele define a senha no primeiro acesso,
 * com o código enviado por e-mail. Os perfis passam pelas mesmas regras das
 * rotas de perfil (centro de custo ativo, aprovador vigente etc.).
 */
@Injectable()
export class CriarColaboradorService {
  constructor(
    private readonly colaboradorRepository: ColaboradorRepositoryContract,
    private readonly usuarioRepository: UsuarioRepositoryContract,
    private readonly centroCustoRepository: CentroCustoRepositoryContract,
    private readonly tornarAprovadorService: TornarAprovadorService,
    private readonly tornarSolicitanteService: TornarSolicitanteService,
    private readonly tornarSolicitanteEmergenciaService: TornarSolicitanteEmergenciaService,
  ) {}

  async execute(params: {
    nome: string;
    email: string;
    cpf?: string;
    cargo?: string;
    empresaId: number;
    filialId: number;
    centroCustoId: number;
    perfis: TipoPerfil[];
  }): Promise<Colaborador> {
    const { email, cpf, empresaId, filialId, centroCustoId, perfis } = params;

    if (await this.usuarioRepository.buscarPorEmail(email)) {
      throw new EmailJaCadastradoException(email);
    }

    if (cpf && (await this.usuarioRepository.buscarPorCpf(cpf))) {
      throw new CpfJaCadastradoException(cpf);
    }

    // Confere filial e centro de custo antes de gravar o usuário.
    const centroCusto = await this.centroCustoRepository.buscar(
      empresaId,
      filialId,
      centroCustoId,
    );

    if (!centroCusto) {
      throw new CentroCustoNaoEncontradoException(filialId, centroCustoId);
    }

    const colaboradorId = await this.colaboradorRepository.criar({
      nome: params.nome,
      email,
      cpf,
      cargo: params.cargo,
      empresaId,
      filialId,
    });

    const escopo = { colaboradorId, empresaId, filialId };

    // O aprovador vem antes: o solicitante exige aprovador vigente no centro
    // de custo, e o próprio colaborador pode ser esse aprovador.
    if (perfis.includes(TipoPerfil.APROVADOR)) {
      await this.tornarAprovadorService.execute({ ...escopo, centroCustoId });
    }

    if (perfis.includes(TipoPerfil.SOLICITANTE)) {
      await this.tornarSolicitanteService.execute({ ...escopo, centroCustoId });
    }

    if (perfis.includes(TipoPerfil.SOLICITANTE_EMERGENCIA)) {
      await this.tornarSolicitanteEmergenciaService.execute(escopo);
    }

    const colaborador = await this.colaboradorRepository.buscar(colaboradorId);

    if (!colaborador) {
      throw new ColaboradorNaoEncontradoException(colaboradorId);
    }

    return colaborador;
  }
}
