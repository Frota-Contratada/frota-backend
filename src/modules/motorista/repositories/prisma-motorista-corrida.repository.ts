import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DateTime } from 'luxon';
import { PrismaService } from '@core/prisma/services/prisma.service';
import { StatusCorrida } from '@module/solicitacao/enums/status-corrida.enum';
import {
  CorridaNaoEncontradaException,
  CorridaNaoPodeSerIniciadaException,
  CorridaNaoPodeSerRecusadaException,
} from '../exceptions';
import { MotoristaCorrida, MotoristaPerfil } from '../domain/motorista-corrida';
import { MotoristaCorridaRepositoryContract } from './motorista-corrida-repository.contract';

const INCLUDE_CORRIDA = {
  Solicitacao: {
    include: {
      Endereco_Solicitacao_nCdEnderecoOrigemToEndereco: true,
      Endereco_Solicitacao_nCdEnderecoDestinoToEndereco: true,
      Usuario: true,
    },
  },
  Veiculo: true,
  RecusaCorrida: {
    orderBy: { dRecusa: 'desc' },
    take: 1,
  },
} satisfies Prisma.CorridaInclude;

type PrismaMotoristaCorrida = Prisma.CorridaGetPayload<{
  include: typeof INCLUDE_CORRIDA;
}>;

@Injectable()
export class PrismaMotoristaCorridaRepository extends MotoristaCorridaRepositoryContract {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async buscarViagens(
    motoristaId: number,
    inicio: DateTime,
    fim: DateTime,
  ): Promise<MotoristaCorrida[]> {
    const corridas = await this.prismaService.corrida.findMany({
      where: {
        nCdMotorista: motoristaId,
        cStatus: { not: StatusCorrida.CANCELADA },
        Solicitacao: {
          cStatus: 'A',
          dCorrida: {
            gte: inicio.startOf('day').toJSDate(),
            lte: fim.endOf('day').toJSDate(),
          },
        },
      },
      include: INCLUDE_CORRIDA,
      orderBy: { Solicitacao: { dCorrida: 'asc' } },
    });

    return this.toDomains(corridas);
  }

  async buscar(
    corridaId: number,
    motoristaId: number,
  ): Promise<MotoristaCorrida | null> {
    const corrida = await this.prismaService.corrida.findFirst({
      where: { nCdCorrida: corridaId, nCdMotorista: motoristaId },
      include: INCLUDE_CORRIDA,
    });

    if (corrida == null) return null;
    const [resultado] = await this.toDomains([corrida]);
    return resultado;
  }

  async iniciar(
    corridaId: number,
    motoristaId: number,
  ): Promise<MotoristaCorrida> {
    return this.prismaService.$transaction(async (tx) => {
      const atual = await tx.corrida.findFirst({
        where: { nCdCorrida: corridaId, nCdMotorista: motoristaId },
        include: INCLUDE_CORRIDA,
      });

      if (atual == null) {
        throw new CorridaNaoEncontradaException(corridaId);
      }

      const [tipoAtual] = await tx.tipoCorrida.findMany({
        where: { nCdTipoCorrida: atual.Solicitacao.nCdTipoCorrida },
        take: 1,
      });
      const dominioAtual = this.toDomain(
        atual,
        tipoAtual?.cNmTipoCorrida ?? '',
      );
      const limiteInicio = DateTime.now().plus({ minutes: 30 });

      if (
        !dominioAtual.ehProxima ||
        dominioAtual.dataHoraPartida > limiteInicio
      ) {
        throw new CorridaNaoPodeSerIniciadaException();
      }

      const atualizacao = await tx.corrida.updateMany({
        where: {
          nCdCorrida: corridaId,
          nCdMotorista: motoristaId,
          cStatus: atual.cStatus,
        },
        data: {
          cStatus: StatusCorrida.INICIADA,
          dInicioCorrida: new Date(),
        },
      });

      if (atualizacao.count !== 1) {
        throw new CorridaNaoPodeSerIniciadaException();
      }

      const iniciada = await tx.corrida.findFirst({
        where: { nCdCorrida: corridaId, nCdMotorista: motoristaId },
        include: INCLUDE_CORRIDA,
      });

      if (iniciada == null) {
        throw new CorridaNaoEncontradaException(corridaId);
      }

      const [tipoIniciada] = await tx.tipoCorrida.findMany({
        where: { nCdTipoCorrida: iniciada.Solicitacao.nCdTipoCorrida },
        take: 1,
      });
      return this.toDomain(iniciada, tipoIniciada?.cNmTipoCorrida ?? '');
    });
  }

  async recusar(
    corridaId: number,
    motoristaId: number,
    motivo: string,
  ): Promise<MotoristaCorrida> {
    return this.prismaService.$transaction(async (tx) => {
      const atual = await tx.corrida.findFirst({
        where: {
          nCdCorrida: corridaId,
          nCdMotorista: motoristaId,
          cStatus: StatusCorrida.AGENDADA,
        },
        include: INCLUDE_CORRIDA,
      });

      if (atual == null) {
        const corrida = await tx.corrida.findFirst({
          where: { nCdCorrida: corridaId, nCdMotorista: motoristaId },
          select: { cStatus: true },
        });

        if (corrida == null) {
          throw new CorridaNaoEncontradaException(corridaId);
        }

        throw new CorridaNaoPodeSerRecusadaException();
      }

      const ultimaRecusa = await tx.recusaCorrida.aggregate({
        _max: { nCdRecusaCorrida: true },
      });
      const recusaId =
        (ultimaRecusa._max.nCdRecusaCorrida?.toNumber() ?? 0) + 1;

      await tx.recusaCorrida.create({
        data: {
          nCdRecusaCorrida: recusaId,
          nCdCorrida: corridaId,
          nCdMotorista: motoristaId,
          cMotivo: motivo.trim(),
        },
      });

      await tx.corrida.update({
        where: { nCdCorrida: corridaId },
        data: { cStatus: StatusCorrida.CANCELADA },
      });

      const recusada = await tx.corrida.findUnique({
        where: { nCdCorrida: corridaId },
        include: INCLUDE_CORRIDA,
      });

      if (recusada == null) {
        throw new CorridaNaoEncontradaException(corridaId);
      }

      const [tipo] = await tx.tipoCorrida.findMany({
        where: { nCdTipoCorrida: recusada.Solicitacao.nCdTipoCorrida },
        take: 1,
      });

      return this.toDomain(recusada, tipo?.cNmTipoCorrida ?? '');
    });
  }

  async buscarPerfil(motoristaId: number): Promise<MotoristaPerfil | null> {
    const [usuario, corridas] = await Promise.all([
      this.prismaService.usuario.findUnique({
        where: { nCdUsuario: motoristaId },
        include: { Fornecedor: true },
      }),
      this.prismaService.corrida.findMany({
        where: {
          nCdMotorista: motoristaId,
          cStatus: { not: StatusCorrida.CANCELADA },
          OR: [
            {
              cStatus: {
                in: [StatusCorrida.FINALIZADA, StatusCorrida.CANCELADA],
              },
            },
            { dFimCorrida: { not: null } },
          ],
        },
        include: INCLUDE_CORRIDA,
        orderBy: { Solicitacao: { dCorrida: 'desc' } },
      }),
    ]);

    if (usuario == null) return null;

    const historico = await this.toDomains(corridas);
    const finalizadas = historico.filter(
      (corrida) => corrida.status === StatusCorrida.FINALIZADA,
    );
    const transportesDeItens = finalizadas.filter((corrida) =>
      this.isTransporteDeItens(corrida.tipoCorrida),
    ).length;

    return new MotoristaPerfil(
      usuario.nCdUsuario.toNumber(),
      usuario.cNmUsuario,
      usuario.cEmail,
      historico,
      usuario.cCPF ?? undefined,
      usuario.Fornecedor?.cNmFornecedor,
      usuario.cCaminhoFotoPerfil ?? undefined,
      finalizadas.length,
      transportesDeItens,
    );
  }

  private async toDomains(
    corridas: PrismaMotoristaCorrida[],
  ): Promise<MotoristaCorrida[]> {
    if (corridas.length === 0) return [];

    const ids = [
      ...new Set(
        corridas.map((corrida) =>
          corrida.Solicitacao.nCdTipoCorrida.toNumber(),
        ),
      ),
    ];
    const tipos = await this.prismaService.tipoCorrida.findMany({
      where: { nCdTipoCorrida: { in: ids } },
    });
    const nomes = new Map(
      tipos.map((tipo) => [
        tipo.nCdTipoCorrida.toNumber(),
        tipo.cNmTipoCorrida,
      ]),
    );

    return corridas.map((corrida) =>
      this.toDomain(
        corrida,
        nomes.get(corrida.Solicitacao.nCdTipoCorrida.toNumber()) ?? '',
      ),
    );
  }

  private toDomain(
    corrida: PrismaMotoristaCorrida,
    tipoCorrida: string,
  ): MotoristaCorrida {
    const dataHoraPartida = DateTime.fromJSDate(corrida.Solicitacao.dCorrida);
    const agora = DateTime.now();
    const status = this.toStatus(corrida.cStatus);
    const ehProxima = this.isProxima(corrida, dataHoraPartida, status, agora);
    const minutosRestantes = ehProxima
      ? Math.max(0, Math.ceil(dataHoraPartida.diff(agora, 'minutes').minutes))
      : undefined;

    return new MotoristaCorrida(
      corrida.nCdCorrida.toNumber(),
      dataHoraPartida,
      this.formatarEndereco(
        corrida.Solicitacao.Endereco_Solicitacao_nCdEnderecoOrigemToEndereco,
      ),
      this.formatarEndereco(
        corrida.Solicitacao.Endereco_Solicitacao_nCdEnderecoDestinoToEndereco,
      ),
      corrida.Solicitacao.Usuario.cNmUsuario,
      corrida.Solicitacao.nValorEstimado.toNumber(),
      tipoCorrida,
      status,
      corrida.Veiculo.cPlaca,
      corrida.dFimCorrida == null
        ? undefined
        : DateTime.fromJSDate(corrida.dFimCorrida),
      ehProxima,
      minutosRestantes,
      corrida.RecusaCorrida.at(0)?.cMotivo,
    );
  }

  private isProxima(
    corrida: PrismaMotoristaCorrida,
    dataHoraPartida: DateTime,
    status: StatusCorrida,
    agora: DateTime,
  ): boolean {
    if (status === StatusCorrida.AGENDADA) return true;
    if (status !== StatusCorrida.INICIADA || dataHoraPartida <= agora) {
      return false;
    }

    const dataInicio = DateTime.fromJSDate(corrida.dInicioCorrida);
    return Math.abs(dataInicio.diff(dataHoraPartida, 'seconds').seconds) < 2;
  }

  private toStatus(valor: string): StatusCorrida {
    const status = valor.trim();
    return (Object.values(StatusCorrida) as string[]).includes(status)
      ? (status as StatusCorrida)
      : StatusCorrida.INICIADA;
  }

  private formatarEndereco(endereco: {
    cEndereco: string;
    cNumero: string;
    cBairro: string;
    cCidade: string;
    cUf: string;
  }): string {
    const partes = [
      endereco.cEndereco,
      endereco.cNumero && endereco.cNumero !== 'S/N'
        ? endereco.cNumero
        : undefined,
      endereco.cBairro,
    ].filter(Boolean);
    const linha = partes.join(', ');
    return endereco.cCidade
      ? `${linha} - ${endereco.cCidade}/${endereco.cUf}`
      : linha;
  }

  private isTransporteDeItens(tipo: string): boolean {
    const normalizado = tipo.toLowerCase();
    return normalizado.includes('objeto') || normalizado.includes('item');
  }
}
