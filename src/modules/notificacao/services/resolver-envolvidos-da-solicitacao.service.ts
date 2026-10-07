import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { StatusCorrida } from '@module/solicitacao/enums/status-corrida.enum';
import { TipoPerfil } from '@module/autenticacao/enums/tipo-perfil.enum';

export interface EnvolvidosDaSolicitacao {
  solicitacaoId: number;
  dataCorrida: Date;
  solicitanteId: number;
  solicitanteNome?: string;
  aprovadorIds: number[];
  fornecedorIds: number[];
  /** Passageiros com usuário cadastrado, incluindo o solicitante quando ele viaja. */
  passageiroIds: number[];
  motoristaId?: number;
  corridaId?: number;
  placaVeiculo?: string;
}

/**
 * Reúne, numa consulta só, todos os usuários que precisam ser avisados sobre
 * uma solicitação: solicitante, aprovadores dos centros de custo, usuários do
 * fornecedor, passageiros e o motorista da corrida (quando já existe).
 */
@Injectable()
export class ResolverEnvolvidosDaSolicitacaoService {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    solicitacaoId: number,
    opcoes: { incluirCorridasCanceladas?: boolean } = {},
  ): Promise<EnvolvidosDaSolicitacao | null> {
    const solicitacao = await this.prismaService.solicitacao.findUnique({
      where: { nCdSolicitacao: solicitacaoId },
      select: {
        nCdSolicitante: true,
        nCdFornecedor: true,
        dCorrida: true,
        Usuario: { select: { cNmUsuario: true } },
        SolicitacaoCentroCusto: { select: { nCdAprovador: true } },
        SolicitacaoPassageiro: { select: { cCPF: true } },
        Corrida: {
          where: opcoes.incluirCorridasCanceladas
            ? {}
            : { cStatus: { not: StatusCorrida.CANCELADA } },
          orderBy: { nCdCorrida: 'desc' },
          take: 1,
          select: {
            nCdCorrida: true,
            nCdMotorista: true,
            Veiculo: { select: { cPlaca: true } },
          },
        },
      },
    });

    if (solicitacao == null) return null;

    const cpfs = solicitacao.SolicitacaoPassageiro.map(
      (passageiro) => passageiro.cCPF,
    );
    const [fornecedorIds, passageiroIds] = await Promise.all([
      this.buscarUsuariosDoFornecedor(solicitacao.nCdFornecedor.toNumber()),
      this.buscarUsuariosPorCpf(cpfs),
    ]);

    const corrida = solicitacao.Corrida.at(0);

    return {
      solicitacaoId,
      dataCorrida: solicitacao.dCorrida,
      solicitanteId: solicitacao.nCdSolicitante.toNumber(),
      solicitanteNome: solicitacao.Usuario.cNmUsuario,
      aprovadorIds: [
        ...new Set(
          solicitacao.SolicitacaoCentroCusto.map((rateio) =>
            rateio.nCdAprovador.toNumber(),
          ),
        ),
      ],
      fornecedorIds,
      passageiroIds,
      motoristaId: corrida?.nCdMotorista.toNumber(),
      corridaId: corrida?.nCdCorrida.toNumber(),
      placaVeiculo: corrida?.Veiculo.cPlaca,
    };
  }

  private async buscarUsuariosDoFornecedor(
    fornecedorId: number,
  ): Promise<number[]> {
    const agora = new Date();
    const usuarios = await this.prismaService.usuario.findMany({
      where: {
        nCdFornecedor: fornecedorId,
        OR: [{ dDesativacao: null }, { dDesativacao: { gt: agora } }],
        UsuarioPerfil: {
          some: {
            cTipoPerfil: TipoPerfil.ADMIN_FORNECEDOR,
            dInicioVigencia: { lte: agora },
            OR: [{ dFimVigencia: null }, { dFimVigencia: { gt: agora } }],
          },
        },
      },
      select: { nCdUsuario: true },
    });

    return usuarios.map((usuario) => usuario.nCdUsuario.toNumber());
  }

  private async buscarUsuariosPorCpf(cpfs: string[]): Promise<number[]> {
    if (cpfs.length === 0) return [];

    const agora = new Date();
    const usuarios = await this.prismaService.usuario.findMany({
      where: {
        cCPF: { in: cpfs },
        OR: [{ dDesativacao: null }, { dDesativacao: { gt: agora } }],
      },
      select: { nCdUsuario: true },
    });

    return usuarios.map((usuario) => usuario.nCdUsuario.toNumber());
  }
}
