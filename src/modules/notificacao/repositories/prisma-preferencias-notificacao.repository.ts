import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/services/prisma.service';
import {
  AlteracaoPreferenciasNotificacao,
  CategoriaNotificacao,
  PreferenciasNotificacao,
  preferenciasPadrao,
} from '../domain/preferencias-notificacao';
import { PreferenciasNotificacaoRepositoryContract } from './preferencias-notificacao-repository.contract';

interface RegistroPreferencias {
  nCdUsuario: { toNumber(): number };
  cPushAtivo: string;
  cLembreteViagem: string;
  cCorridaConfirmada: string;
  cSolicitacaoEncerrada: string;
  cCorridaCancelada: string;
  cAprovacaoPendente: string;
  cDecisaoFornecedor: string;
  dAtualizacao: Date;
}

type ColunaCategoria = Exclude<
  keyof RegistroPreferencias,
  'nCdUsuario' | 'cPushAtivo' | 'dAtualizacao'
>;

const COLUNA_POR_CATEGORIA: Record<CategoriaNotificacao, ColunaCategoria> = {
  [CategoriaNotificacao.LEMBRETE_VIAGEM]: 'cLembreteViagem',
  [CategoriaNotificacao.CORRIDA_CONFIRMADA]: 'cCorridaConfirmada',
  [CategoriaNotificacao.SOLICITACAO_ENCERRADA]: 'cSolicitacaoEncerrada',
  [CategoriaNotificacao.CORRIDA_CANCELADA]: 'cCorridaCancelada',
  [CategoriaNotificacao.APROVACAO_PENDENTE]: 'cAprovacaoPendente',
  [CategoriaNotificacao.DECISAO_FORNECEDOR]: 'cDecisaoFornecedor',
};

const paraFlag = (valor: boolean): string => (valor ? 'S' : 'N');

@Injectable()
export class PrismaPreferenciasNotificacaoRepository extends PreferenciasNotificacaoRepositoryContract {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async buscar(usuarioId: number): Promise<PreferenciasNotificacao> {
    const registro = await this.prisma.usuarioPreferenciaNotificacao.findUnique(
      {
        where: { nCdUsuario: usuarioId },
      },
    );

    return registro ? this.paraDominio(registro) : preferenciasPadrao();
  }

  async buscarPorUsuarios(
    usuarioIds: number[],
  ): Promise<Map<number, PreferenciasNotificacao>> {
    const resultado = new Map<number, PreferenciasNotificacao>();
    if (usuarioIds.length === 0) return resultado;

    const registros = await this.prisma.usuarioPreferenciaNotificacao.findMany({
      where: { nCdUsuario: { in: usuarioIds } },
    });

    for (const registro of registros) {
      resultado.set(registro.nCdUsuario.toNumber(), this.paraDominio(registro));
    }

    return resultado;
  }

  async atualizar(
    usuarioId: number,
    alteracao: AlteracaoPreferenciasNotificacao,
  ): Promise<PreferenciasNotificacao> {
    const dados = this.paraColunas(alteracao);

    const registro = await this.prisma.usuarioPreferenciaNotificacao.upsert({
      where: { nCdUsuario: usuarioId },
      create: { nCdUsuario: usuarioId, ...dados },
      update: dados,
    });

    return this.paraDominio(registro);
  }

  private paraColunas(
    alteracao: AlteracaoPreferenciasNotificacao,
  ): Partial<Record<ColunaCategoria | 'cPushAtivo', string>> {
    const colunas: Partial<Record<ColunaCategoria | 'cPushAtivo', string>> = {};

    if (alteracao.pushAtivo !== undefined) {
      colunas.cPushAtivo = paraFlag(alteracao.pushAtivo);
    }

    for (const [categoria, ativa] of Object.entries(
      alteracao.categorias ?? {},
    )) {
      if (ativa === undefined) continue;
      colunas[COLUNA_POR_CATEGORIA[categoria as CategoriaNotificacao]] =
        paraFlag(ativa);
    }

    return colunas;
  }

  private paraDominio(registro: RegistroPreferencias): PreferenciasNotificacao {
    const padrao = preferenciasPadrao();
    const categorias = { ...padrao.categorias };

    for (const categoria of Object.values(CategoriaNotificacao)) {
      categorias[categoria] = registro[COLUNA_POR_CATEGORIA[categoria]] !== 'N';
    }

    return {
      pushAtivo: registro.cPushAtivo !== 'N',
      categorias,
      atualizadoEm: registro.dAtualizacao,
    };
  }
}
