import 'dotenv/config';
import { PrismaMssql } from '@prisma/adapter-mssql';
import { PrismaClient } from '@prisma/client';
import { DateTime } from 'luxon';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL não configurada.');
}

const prisma = new PrismaClient({
  adapter: new PrismaMssql(databaseUrl),
});

const ZONA = process.env.TZ ?? 'UTC';
const USUARIO_PASSAGEIRO = 1002;
const USUARIO_APROVADOR = 1003;
const FORNECEDOR = 1;
const FILIAL = 1;
const CENTRO_CUSTO = 101;
const TIPO_CORRIDA_TAXI = 1;
const TIPO_VEICULO_CARRO = 2;
const MOTIVO_VIAGEM_TRABALHO = 1;
const ORIGEM = 2;
const DESTINO_AEROPORTO = 3;
const DESTINO_CLIENTE = 7;
const CPF_PASSAGEIRO = '11122233344';

const agora = DateTime.now().setZone(ZONA);
const inicioSemana = agora.startOf('day').minus({ days: agora.weekday % 7 });

const solicitacoes = [
  {
    id: 10001,
    dataCorrida: inicioSemana.plus({ days: 5, hours: 10, minutes: 30 }),
    destino: DESTINO_AEROPORTO,
    distancia: 4.3,
    valor: 19.97,
  },
  {
    id: 10002,
    dataCorrida: inicioSemana.plus({ days: 6, hours: 14 }),
    destino: DESTINO_CLIENTE,
    distancia: 1.8,
    valor: 12.72,
  },
];

async function validarDependencias() {
  const [
    passageiro,
    fornecedor,
    tipoCorrida,
    tipoVeiculo,
    origem,
    aeroporto,
    cliente,
    motivo,
    centroCusto,
    aprovador,
  ] = await Promise.all([
    prisma.usuario.findUnique({ where: { nCdUsuario: USUARIO_PASSAGEIRO } }),
    prisma.fornecedor.findUnique({ where: { nCdFornecedor: FORNECEDOR } }),
    prisma.tipoCorrida.findUnique({
      where: { nCdTipoCorrida: TIPO_CORRIDA_TAXI },
    }),
    prisma.tipoVeiculo.findUnique({
      where: { nCdTpVeiculo: TIPO_VEICULO_CARRO },
    }),
    prisma.endereco.findUnique({ where: { nCdEndereco: ORIGEM } }),
    prisma.endereco.findUnique({ where: { nCdEndereco: DESTINO_AEROPORTO } }),
    prisma.endereco.findUnique({ where: { nCdEndereco: DESTINO_CLIENTE } }),
    prisma.motivo.findUnique({ where: { nCdMotivo: MOTIVO_VIAGEM_TRABALHO } }),
    prisma.centroCusto.findUnique({
      where: {
        nCdFilial_nCdCentroCusto: {
          nCdFilial: FILIAL,
          nCdCentroCusto: CENTRO_CUSTO,
        },
      },
    }),
    prisma.usuario.findUnique({ where: { nCdUsuario: USUARIO_APROVADOR } }),
  ]);

  const dependencias = [
    ['passageiro', passageiro],
    ['fornecedor', fornecedor],
    ['tipo de corrida', tipoCorrida],
    ['tipo de veículo', tipoVeiculo],
    ['origem', origem],
    ['aeroporto', aeroporto],
    ['cliente', cliente],
    ['motivo', motivo],
    ['centro de custo', centroCusto],
    ['aprovador', aprovador],
  ];

  const ausentes = dependencias
    .filter(([, registro]) => registro == null)
    .map(([nome]) => nome);

  if (ausentes.length > 0) {
    throw new Error(`Dependências ausentes: ${ausentes.join(', ')}.`);
  }
}

async function inserirSolicitacoes() {
  await validarDependencias();

  await prisma.$transaction(async (tx) => {
    const existentes = await tx.solicitacao.findMany({
      where: { nCdSolicitacao: { in: solicitacoes.map(({ id }) => id) } },
      select: { nCdSolicitacao: true },
    });

    if (existentes.length > 0) {
      const ids = existentes.map(({ nCdSolicitacao }) =>
        nCdSolicitacao.toString(),
      );
      throw new Error(
        `IDs já existentes; nenhuma linha foi alterada: ${ids.join(', ')}.`,
      );
    }

    for (const solicitacao of solicitacoes) {
      await tx.solicitacao.create({
        data: {
          nCdSolicitacao: solicitacao.id,
          nCdSolicitante: USUARIO_PASSAGEIRO,
          nCdFornecedor: FORNECEDOR,
          dCorrida: solicitacao.dataCorrida.toJSDate(),
          nDistanciaEstimada: solicitacao.distancia,
          nCdTipoCorrida: TIPO_CORRIDA_TAXI,
          nCdTpVeiculo: TIPO_VEICULO_CARRO,
          nCdEnderecoOrigem: ORIGEM,
          nCdEnderecoDestino: solicitacao.destino,
          nValorEstimado: solicitacao.valor,
          cStatus: 'A',
          nCdMotivoSolicitacao: MOTIVO_VIAGEM_TRABALHO,
        },
      });

      await tx.solicitacaoCentroCusto.create({
        data: {
          nCdSolicitacao: solicitacao.id,
          nCdFilial: FILIAL,
          nCdCentroCusto: CENTRO_CUSTO,
          nCdAprovador: USUARIO_APROVADOR,
          cStatusAprovacao: 'A',
        },
      });

      await tx.solicitacaoPassageiro.create({
        data: {
          nCdSolicitacao: solicitacao.id,
          cCPF: CPF_PASSAGEIRO,
        },
      });
    }
  });
}

inserirSolicitacoes()
  .then(() => {
    for (const solicitacao of solicitacoes) {
      console.log(
        `Solicitação aprovada adicionada: ${solicitacao.id} - ${solicitacao.dataCorrida.toISO()}`,
      );
    }
  })
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
