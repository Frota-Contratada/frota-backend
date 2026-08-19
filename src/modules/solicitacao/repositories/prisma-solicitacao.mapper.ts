import { Endereco as PrismaEndereco, Prisma } from '@prisma/client';
import { DateTime } from 'luxon';
import { CorridaSolicitacao } from '../domain/corrida-solicitacao';
import { Endereco } from '../domain/endereco';
import { Motivo } from '../domain/motivo';
import { Parada } from '../domain/parada';
import { Solicitacao } from '../domain/solicitacao';
import { SolicitacaoCentroCusto } from '../domain/solicitacao-centro-custo';
import { SolicitacaoPassageiro } from '../domain/solicitacao-passageiro';
import { TipoCorrida } from '../domain/tipo-corrida';
import { TipoVeiculo } from '../domain/tipo-veiculo';
import { StatusAprovacao } from '../enums/status-aprovacao.enum';
import { StatusCorrida } from '../enums/status-corrida.enum';
import { StatusSolicitacao } from '../enums/status-solicitacao.enum';
import { TipoMotivo } from '../enums/tipo-motivo.enum';

export const INCLUDE_SOLICITACAO = {
  Endereco_Solicitacao_nCdEnderecoOrigemToEndereco: true,
  Endereco_Solicitacao_nCdEnderecoDestinoToEndereco: true,
  Motivo_Solicitacao_nCdMotivoSolicitacaoToMotivo: true,
  Motivo_Solicitacao_nCdMotivoCancelamentoToMotivo: true,
  TipoVeiculo: true,
  Usuario: true,
  Fornecedor: true,
  Parada: { include: { Endereco: true } },
  SolicitacaoPassageiro: true,
  SolicitacaoCentroCusto: {
    include: { CentroCusto: true, Motivo: true, Usuario: true },
  },
  Corrida: { include: { Usuario: true, Veiculo: true } },
} satisfies Prisma.SolicitacaoInclude;

export type PrismaSolicitacaoCompleta = Prisma.SolicitacaoGetPayload<{
  include: typeof INCLUDE_SOLICITACAO;
}>;

export interface ContextoSolicitacao {
  tiposCorrida: Map<number, TipoCorrida>;
  nomesPorCpf?: Map<string, string>;
}

export const NUMERO_NAO_INFORMADO = 'S/N';

type PrismaMotivoBasico = {
  nCdMotivo: Prisma.Decimal;
  cNmMotivo: string;
  cTipoMotivo: string;
};

export class PrismaSolicitacaoMapper {
  static toDomain(
    entity: PrismaSolicitacaoCompleta,
    contexto: ContextoSolicitacao,
  ): Solicitacao;
  static toDomain(
    entity: PrismaSolicitacaoCompleta | null,
    contexto: ContextoSolicitacao,
  ): Solicitacao | null;
  static toDomain(
    entity: PrismaSolicitacaoCompleta | null,
    contexto: ContextoSolicitacao,
  ): Solicitacao | null {
    if (entity == null) return null;

    const tipoCorridaId = entity.nCdTipoCorrida.toNumber();
    const solicitanteCpf = entity.Usuario.cCPF;

    return new Solicitacao(
      entity.nCdSolicitante.toNumber(),
      entity.nCdFornecedor.toNumber(),
      contexto.tiposCorrida.get(tipoCorridaId) ??
        new TipoCorrida(tipoCorridaId, ''),
      DateTime.fromJSDate(entity.dCorrida),
      PrismaSolicitacaoMapper.enderecoToDomain(
        entity.Endereco_Solicitacao_nCdEnderecoOrigemToEndereco,
      ),
      PrismaSolicitacaoMapper.enderecoToDomain(
        entity.Endereco_Solicitacao_nCdEnderecoDestinoToEndereco,
      ),
      PrismaSolicitacaoMapper.motivoToDomain(
        entity.Motivo_Solicitacao_nCdMotivoSolicitacaoToMotivo,
      ),
      entity.nDistanciaEstimada.toNumber(),
      entity.nValorEstimado.toNumber(),
      {
        id: entity.nCdSolicitacao.toNumber(),
        dataCriacao: DateTime.fromJSDate(entity.dCriacao),
        status: PrismaSolicitacaoMapper.paraStatusSolicitacao(entity.cStatus),
        tipoVeiculo:
          entity.TipoVeiculo == null
            ? undefined
            : new TipoVeiculo(
                entity.TipoVeiculo.nCdTpVeiculo.toNumber(),
                entity.TipoVeiculo.cNmTpVeiculo,
              ),
        solicitanteNome: entity.Usuario.cNmUsuario,
        fornecedorNome: entity.Fornecedor.cNmFornecedor,
        motivoCancelamento: PrismaSolicitacaoMapper.motivoToDomain(
          entity.Motivo_Solicitacao_nCdMotivoCancelamentoToMotivo,
        ),
        paradas: entity.Parada.map(
          (parada) =>
            new Parada(
              parada.iOrdem,
              PrismaSolicitacaoMapper.enderecoToDomain(parada.Endereco),
              parada.iTempoParadaMinutos ?? undefined,
            ),
        ).sort((uma, outra) => uma.ordem - outra.ordem),
        passageiros: entity.SolicitacaoPassageiro.map(
          (passageiro) =>
            new SolicitacaoPassageiro(
              passageiro.cCPF,
              contexto.nomesPorCpf?.get(passageiro.cCPF),
              passageiro.cCPF === solicitanteCpf,
            ),
        ),
        centrosCusto: entity.SolicitacaoCentroCusto.map(
          (rateio) =>
            new SolicitacaoCentroCusto(
              rateio.nCdFilial.toNumber(),
              rateio.nCdCentroCusto.toNumber(),
              rateio.nCdAprovador.toNumber(),
              PrismaSolicitacaoMapper.paraStatusAprovacao(
                rateio.cStatusAprovacao,
              ),
              rateio.CentroCusto.cNmCentroCusto,
              rateio.Usuario.cNmUsuario,
              PrismaSolicitacaoMapper.motivoToDomain(rateio.Motivo),
            ),
        ),
        corrida: PrismaSolicitacaoMapper.corridaToDomain(entity.Corrida),
      },
    );
  }

  private static enderecoToDomain(entity: PrismaEndereco): Endereco {
    return new Endereco(
      entity.cEndereco,
      entity.cCidade,
      entity.cUf,
      entity.nLatitude.toNumber(),
      entity.nLongitude.toNumber(),
      entity.nCdEndereco.toNumber(),
      PrismaSolicitacaoMapper.textoOuIndefinido(entity.cNumero),
      PrismaSolicitacaoMapper.textoOuIndefinido(entity.cBairro),
      PrismaSolicitacaoMapper.textoOuIndefinido(entity.cCEP),
      PrismaSolicitacaoMapper.textoOuIndefinido(entity.cComplemento),
    );
  }

  private static motivoToDomain(entity: PrismaMotivoBasico): Motivo;
  private static motivoToDomain(
    entity: PrismaMotivoBasico | null,
  ): Motivo | undefined;
  private static motivoToDomain(
    entity: PrismaMotivoBasico | null,
  ): Motivo | undefined {
    if (entity == null) return undefined;

    return new Motivo(
      entity.nCdMotivo.toNumber(),
      entity.cNmMotivo,
      PrismaSolicitacaoMapper.paraTipoMotivo(entity.cTipoMotivo),
    );
  }

  private static corridaToDomain(
    corridas: PrismaSolicitacaoCompleta['Corrida'],
  ): CorridaSolicitacao | undefined {
    const relevantes = [...corridas].sort(
      (uma, outra) =>
        outra.dInicioCorrida.getTime() - uma.dInicioCorrida.getTime(),
    );

    const corrida = relevantes.at(0);

    if (corrida == null) return undefined;

    return new CorridaSolicitacao(
      corrida.nCdCorrida.toNumber(),
      PrismaSolicitacaoMapper.paraStatusCorrida(corrida.cStatus),
      DateTime.fromJSDate(corrida.dInicioCorrida),
      corrida.nCdMotorista.toNumber(),
      corrida.nKmPercorrido.toNumber(),
      corrida.nValorFinal.toNumber(),
      corrida.Veiculo.cPlaca,
      corrida.Usuario.cNmUsuario,
      corrida.dFimCorrida == null
        ? undefined
        : DateTime.fromJSDate(corrida.dFimCorrida),
    );
  }

  private static paraStatusSolicitacao(valor: string): StatusSolicitacao {
    const status = valor.trim();
    const validos = Object.values(StatusSolicitacao) as string[];

    return validos.includes(status)
      ? (status as StatusSolicitacao)
      : StatusSolicitacao.PENDENTE;
  }

  private static paraStatusAprovacao(valor: string): StatusAprovacao {
    const status = valor.trim();
    const validos = Object.values(StatusAprovacao) as string[];

    return validos.includes(status)
      ? (status as StatusAprovacao)
      : StatusAprovacao.PENDENTE;
  }

  private static paraStatusCorrida(valor: string): StatusCorrida {
    const status = valor.trim();
    const validos = Object.values(StatusCorrida) as string[];

    return validos.includes(status)
      ? (status as StatusCorrida)
      : StatusCorrida.INICIADA;
  }

  private static paraTipoMotivo(valor: string): TipoMotivo {
    const tipo = valor.trim();
    const validos = Object.values(TipoMotivo) as string[];

    return validos.includes(tipo)
      ? (tipo as TipoMotivo)
      : TipoMotivo.SOLICITACAO;
  }

  private static textoOuIndefinido(valor: string | null): string | undefined {
    const texto = valor?.trim();
    return texto ? texto : undefined;
  }
}
