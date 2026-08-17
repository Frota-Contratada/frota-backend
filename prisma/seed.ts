// Dados de teste para o ambiente de desenvolvimento.
// Uso:
// pnpm prisma db seed

import * as argon2 from 'argon2';
import { PrismaMssql } from '@prisma/adapter-mssql';
import { PrismaClient } from '@prisma/client';
import { DateTime } from 'luxon';

const prisma = new PrismaClient({
  adapter: new PrismaMssql(process.env.DATABASE_URL!),
});

const SENHA_PADRAO = 'Teste@123';

const FILIAL_ID = 1;

const CENTRO_CUSTO = {
  OPERACOES: 101,
  ADMINISTRATIVO: 102,
  LOGISTICA: 103,
};

const USUARIO = {
  ADMIN: 1000,
  MOTORISTA: 1001,
  PASSAGEIRO: 1002,
  APROVADOR_OPERACOES: 1003,
  APROVADOR_ADMINISTRATIVO: 1004,
  APROVADOR_LOGISTICA: 1005,
  ACOMPANHANTE: 1006,
};

const CPF = {
  ADMIN: '10020030040',
  MOTORISTA: '99988877766',
  PASSAGEIRO: '11122233344',
  ACOMPANHANTE: '55566677788',
  APROVADOR_OPERACOES: '22233344455',
  APROVADOR_ADMINISTRATIVO: '33344455566',
  APROVADOR_LOGISTICA: '44455566677',
};

const TIPO_CORRIDA = { TAXI: 1, OBJETO: 2 };
const TIPO_VEICULO = { MOTO: 1, CARRO: 2, VAN: 3 };
const FORNECEDOR = { AURORA: 1, ROTA_CERTA: 2 };

const TIPO_MOTIVO = {
  SOLICITACAO: '1',
  CANCELAMENTO: '2',
  RECUSA: '3',
  OBJETO: '4',
};

const MOTIVO = {
  VIAGEM_TRABALHO: 1,
  REUNIAO_EXTERNA: 2,
  VISITA_CLIENTE: 3,
  EMERGENCIA: 4,
  CANCEL_MUDANCA_AGENDA: 20,
  CANCEL_NAO_PRECISO: 21,
  CANCEL_ERRO: 22,
  RECUSA_FORA_POLITICA: 40,
  RECUSA_CC_INCORRETO: 41,
  RECUSA_SEM_VERBA: 42,
  OBJ_DOCUMENTOS: 60,
  OBJ_EQUIPAMENTOS: 61,
  OBJ_ENCOMENDAS: 62,
  OBJ_MATERIAIS: 63,
  OBJ_OUTROS: 64,
};

interface PontoSeed {
  id: number;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  latitude: number;
  longitude: number;
}

const PONTO = {
  FILIAL: {
    id: 1,
    logradouro: 'Avenida Higienópolis',
    numero: '1100',
    bairro: 'Centro',
    cidade: 'Londrina',
    uf: 'PR',
    cep: '86015010',
    latitude: -23.3103,
    longitude: -51.1628,
  },
  CASA: {
    id: 2,
    logradouro: 'Rua Pernambuco',
    numero: '540',
    bairro: 'Centro',
    cidade: 'Londrina',
    uf: 'PR',
    cep: '86020120',
    latitude: -23.3095,
    longitude: -51.165,
  },
  AEROPORTO: {
    id: 3,
    logradouro: 'Avenida Santos Dumont',
    numero: '100',
    bairro: 'Aeroporto',
    cidade: 'Londrina',
    uf: 'PR',
    cep: '86039090',
    latitude: -23.3335,
    longitude: -51.1301,
  },
  SHOPPING: {
    id: 4,
    logradouro: 'Avenida Ayrton Senna da Silva',
    numero: '1560',
    bairro: 'Gleba Fazenda Palhano',
    cidade: 'Londrina',
    uf: 'PR',
    cep: '86050460',
    latitude: -23.3402,
    longitude: -51.1789,
  },
  UNIVERSIDADE: {
    id: 5,
    logradouro: 'Rodovia Celso Garcia Cid',
    numero: 'Km 380',
    bairro: 'Campus Universitário',
    cidade: 'Londrina',
    uf: 'PR',
    cep: '86057970',
    latitude: -23.3255,
    longitude: -51.1996,
  },
  PARADA_MAZZEI: {
    id: 6,
    logradouro: 'Avenida Duque de Caxias',
    numero: '800',
    bairro: 'Jardim Mazzei',
    cidade: 'Londrina',
    uf: 'PR',
    cep: '86015000',
    latitude: -23.3128,
    longitude: -51.1585,
  },
  CLIENTE_CENTRO: {
    id: 7,
    logradouro: 'Rua Quintino Bocaiúva',
    numero: '320',
    bairro: 'Centro',
    cidade: 'Londrina',
    uf: 'PR',
    cep: '86010190',
    latitude: -23.308,
    longitude: -51.1608,
  },
  HOSPITAL: {
    id: 8,
    logradouro: 'Avenida Robert Koch',
    numero: '60',
    bairro: 'Operária',
    cidade: 'Londrina',
    uf: 'PR',
    cep: '86038350',
    latitude: -23.3182,
    longitude: -51.1441,
  },
} satisfies Record<string, PontoSeed>;

const RAIO_TERRA_KM = 6371;
const FATOR_RODOVIARIO = 1.3;
const VELOCIDADE_MEDIA_KMH = 50;

const BANDEIRADA = 7.5;
const VALOR_KM = 2.9;

const paraRadianos = (graus: number) => (graus * Math.PI) / 180;

const distanciaKm = (pontos: PontoSeed[]): number => {
  let total = 0;

  for (let i = 1; i < pontos.length; i += 1) {
    const origem = pontos[i - 1];
    const destino = pontos[i];

    const deltaLat = paraRadianos(destino.latitude - origem.latitude);
    const deltaLng = paraRadianos(destino.longitude - origem.longitude);

    const a =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(paraRadianos(origem.latitude)) *
        Math.cos(paraRadianos(destino.latitude)) *
        Math.sin(deltaLng / 2) ** 2;

    total += 2 * RAIO_TERRA_KM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  return Math.round(total * FATOR_RODOVIARIO * 1000) / 1000;
};

const valorEstimado = (km: number): number =>
  Math.round((BANDEIRADA + VALOR_KM * km) * 100) / 100;

const duracaoMinutos = (km: number): number =>
  Math.ceil((km / VELOCIDADE_MEDIA_KMH) * 60);

const nestaSemana = (diaDaSemana: number, hora: number, minuto = 0) =>
  DateTime.now()
    .startOf('week')
    .plus({ days: diaDaSemana - 1 })
    .set({ hour: hora, minute: minuto, second: 0, millisecond: 0 })
    .toJSDate();

const semanaPassada = (diaDaSemana: number, hora: number) =>
  DateTime.now()
    .startOf('week')
    .minus({ weeks: 1 })
    .plus({ days: diaDaSemana - 1 })
    .set({ hour: hora, minute: 0, second: 0, millisecond: 0 })
    .toJSDate();

async function semearCatalogos() {
  const tiposToken = [
    { id: 1, nome: 'Cadastro de senha', segundos: 300 },
    { id: 2, nome: 'Redefinição de senha', segundos: 300 },
  ];

  for (const tipo of tiposToken) {
    await prisma.tipoToken.upsert({
      where: { nCdTpToken: tipo.id },
      update: { cNmTpToken: tipo.nome, nQtdSegValidade: tipo.segundos },
      create: {
        nCdTpToken: tipo.id,
        cNmTpToken: tipo.nome,
        nQtdSegValidade: tipo.segundos,
      },
    });
  }

  const tiposCorrida = [
    { id: TIPO_CORRIDA.TAXI, nome: 'Táxi' },
    { id: TIPO_CORRIDA.OBJETO, nome: 'Transporte de objetos' },
  ];

  for (const tipo of tiposCorrida) {
    await prisma.tipoCorrida.upsert({
      where: { nCdTipoCorrida: tipo.id },
      update: { cNmTipoCorrida: tipo.nome },
      create: { nCdTipoCorrida: tipo.id, cNmTipoCorrida: tipo.nome },
    });
  }

  const tiposVeiculo = [
    { id: TIPO_VEICULO.MOTO, nome: 'Moto', quantidade: 4 },
    { id: TIPO_VEICULO.CARRO, nome: 'Carro', quantidade: 12 },
    { id: TIPO_VEICULO.VAN, nome: 'Van', quantidade: 3 },
  ];

  for (const tipo of tiposVeiculo) {
    await prisma.tipoVeiculo.upsert({
      where: { nCdTpVeiculo: tipo.id },
      update: { cNmTpVeiculo: tipo.nome, iQntVeiculo: tipo.quantidade },
      create: {
        nCdTpVeiculo: tipo.id,
        cNmTpVeiculo: tipo.nome,
        iQntVeiculo: tipo.quantidade,
      },
    });
  }

  const motivos = [
    { id: MOTIVO.VIAGEM_TRABALHO, nome: 'Viagem de trabalho', tipo: TIPO_MOTIVO.SOLICITACAO },
    { id: MOTIVO.REUNIAO_EXTERNA, nome: 'Reunião externa', tipo: TIPO_MOTIVO.SOLICITACAO },
    { id: MOTIVO.VISITA_CLIENTE, nome: 'Visita a cliente', tipo: TIPO_MOTIVO.SOLICITACAO },
    { id: MOTIVO.EMERGENCIA, nome: 'Emergência', tipo: TIPO_MOTIVO.SOLICITACAO },
    { id: MOTIVO.CANCEL_MUDANCA_AGENDA, nome: 'Mudança de agenda', tipo: TIPO_MOTIVO.CANCELAMENTO },
    { id: MOTIVO.CANCEL_NAO_PRECISO, nome: 'Não preciso mais da corrida', tipo: TIPO_MOTIVO.CANCELAMENTO },
    { id: MOTIVO.CANCEL_ERRO, nome: 'Erro ao preencher a solicitação', tipo: TIPO_MOTIVO.CANCELAMENTO },
    { id: MOTIVO.RECUSA_FORA_POLITICA, nome: 'Fora da política de viagens', tipo: TIPO_MOTIVO.RECUSA },
    { id: MOTIVO.RECUSA_CC_INCORRETO, nome: 'Centro de custo incorreto', tipo: TIPO_MOTIVO.RECUSA },
    { id: MOTIVO.RECUSA_SEM_VERBA, nome: 'Sem verba disponível', tipo: TIPO_MOTIVO.RECUSA },
    { id: MOTIVO.OBJ_DOCUMENTOS, nome: 'Documentos', tipo: TIPO_MOTIVO.OBJETO },
    { id: MOTIVO.OBJ_EQUIPAMENTOS, nome: 'Equipamentos', tipo: TIPO_MOTIVO.OBJETO },
    { id: MOTIVO.OBJ_ENCOMENDAS, nome: 'Encomendas', tipo: TIPO_MOTIVO.OBJETO },
    { id: MOTIVO.OBJ_MATERIAIS, nome: 'Materiais de escritório', tipo: TIPO_MOTIVO.OBJETO },
    { id: MOTIVO.OBJ_OUTROS, nome: 'Outros', tipo: TIPO_MOTIVO.OBJETO },
  ];

  for (const motivo of motivos) {
    await prisma.motivo.upsert({
      where: { nCdMotivo: motivo.id },
      update: { cNmMotivo: motivo.nome, cTipoMotivo: motivo.tipo },
      create: {
        nCdMotivo: motivo.id,
        cNmMotivo: motivo.nome,
        cTipoMotivo: motivo.tipo,
      },
    });
  }

  const tiposRegra = [
    { id: 1, nome: 'Bandeirada' },
    { id: 2, nome: 'Valor por quilômetro' },
    { id: 3, nome: 'Adicional noturno' },
    { id: 4, nome: 'Adicional por parada' },
  ];

  for (const tipo of tiposRegra) {
    await prisma.tipoRegra.upsert({
      where: { nCdTipoRegra: tipo.id },
      update: { cNmRegra: tipo.nome },
      create: { nCdTipoRegra: tipo.id, cNmRegra: tipo.nome },
    });
  }
}

async function semearEnderecos() {
  for (const ponto of Object.values(PONTO)) {
    await prisma.endereco.upsert({
      where: { nCdEndereco: ponto.id },
      update: {},
      create: {
        nCdEndereco: ponto.id,
        cEndereco: ponto.logradouro,
        cNumero: ponto.numero,
        cBairro: ponto.bairro,
        cCidade: ponto.cidade,
        cUf: ponto.uf,
        cCEP: ponto.cep,
        nLatitude: ponto.latitude,
        nLongitude: ponto.longitude,
      },
    });
  }
}

async function semearFilialECentrosCusto() {
  await prisma.filial.upsert({
    where: { nCdFilial: FILIAL_ID },
    update: { cNmFilial: 'Filial Londrina', nCdEndereco: PONTO.FILIAL.id },
    create: {
      nCdFilial: FILIAL_ID,
      cNmFilial: 'Filial Londrina',
      cCNPJ: '12345678000190',
      nCdEndereco: PONTO.FILIAL.id,
    },
  });

  const centrosCusto = [
    { id: CENTRO_CUSTO.OPERACOES, nome: 'Operações' },
    { id: CENTRO_CUSTO.ADMINISTRATIVO, nome: 'Administrativo' },
    { id: CENTRO_CUSTO.LOGISTICA, nome: 'Logística' },
  ];

  for (const centroCusto of centrosCusto) {
    await prisma.centroCusto.upsert({
      where: {
        nCdFilial_nCdCentroCusto: {
          nCdFilial: FILIAL_ID,
          nCdCentroCusto: centroCusto.id,
        },
      },
      update: { cNmCentroCusto: centroCusto.nome, dDesativacao: null },
      create: {
        nCdFilial: FILIAL_ID,
        nCdCentroCusto: centroCusto.id,
        cNmCentroCusto: centroCusto.nome,
      },
    });
  }
}

async function semearUsuarios() {
  const senha = await argon2.hash(SENHA_PADRAO);

  const usuarios = [
    {
      id: USUARIO.ADMIN,
      nome: 'Admin Master',
      email: 'admin.master@frota.com.br',
      cargo: 'Administrador do sistema',
      cpf: CPF.ADMIN,
      perfis: ['admin-master'],
    },
    {
      id: USUARIO.MOTORISTA,
      nome: 'Motorista Teste',
      email: 'motorista.teste@frota.com.br',
      cargo: 'Motorista',
      cpf: CPF.MOTORISTA,
      fornecedorId: FORNECEDOR.AURORA,
      perfis: ['motorista'],
    },
    {
      id: USUARIO.PASSAGEIRO,
      nome: 'Passageiro Teste',
      email: 'passageiro.teste@frota.com.br',
      cargo: 'Analista de Logística',
      cpf: CPF.PASSAGEIRO,
      filialId: FILIAL_ID,
      centroCustoId: CENTRO_CUSTO.OPERACOES,
      perfis: ['solicitante'],
    },
    {
      id: USUARIO.ACOMPANHANTE,
      nome: 'Ana Beatriz Ramos',
      email: 'ana.ramos@frota.com.br',
      cargo: 'Analista Comercial',
      cpf: CPF.ACOMPANHANTE,
      filialId: FILIAL_ID,
      centroCustoId: CENTRO_CUSTO.OPERACOES,
      perfis: ['solicitante'],
    },
    {
      id: USUARIO.APROVADOR_OPERACOES,
      nome: 'Carla Nogueira',
      email: 'carla.nogueira@frota.com.br',
      cargo: 'Coordenadora de Operações',
      cpf: CPF.APROVADOR_OPERACOES,
      filialId: FILIAL_ID,
      centroCustoId: CENTRO_CUSTO.OPERACOES,
      perfis: ['aprovador', 'solicitante'],
    },
    {
      id: USUARIO.APROVADOR_ADMINISTRATIVO,
      nome: 'Diego Prado',
      email: 'diego.prado@frota.com.br',
      cargo: 'Gerente Administrativo',
      cpf: CPF.APROVADOR_ADMINISTRATIVO,
      filialId: FILIAL_ID,
      centroCustoId: CENTRO_CUSTO.ADMINISTRATIVO,
      perfis: ['aprovador'],
    },
    {
      id: USUARIO.APROVADOR_LOGISTICA,
      nome: 'Eduarda Lima',
      email: 'eduarda.lima@frota.com.br',
      cargo: 'Supervisora de Logística',
      cpf: CPF.APROVADOR_LOGISTICA,
      filialId: FILIAL_ID,
      centroCustoId: CENTRO_CUSTO.LOGISTICA,
      perfis: ['aprovador'],
    },
  ];

  for (const usuario of usuarios) {
    const dados = {
      cNmUsuario: usuario.nome,
      cCargo: usuario.cargo,
      cCPF: usuario.cpf ?? null,
      nCdFilial: usuario.filialId ?? null,
      nCdCentroCusto: usuario.centroCustoId ?? null,
      nCdFornecedor: usuario.fornecedorId ?? null,
      cHashSenha: senha,
      cDisponivel: 'S',
      dDesativacao: null,
    };

    await prisma.usuario.upsert({
      where: { nCdUsuario: usuario.id },
      update: dados,
      create: { nCdUsuario: usuario.id, cEmail: usuario.email, ...dados },
    });

    for (const perfil of usuario.perfis) {
      await prisma.usuarioPerfil.upsert({
        where: {
          nCdUsuario_cTipoPerfil: {
            nCdUsuario: usuario.id,
            cTipoPerfil: perfil,
          },
        },
        update: { dFimVigencia: null },
        create: {
          nCdUsuario: usuario.id,
          cTipoPerfil: perfil,
          dInicioVigencia: DateTime.now().minus({ months: 6 }).toJSDate(),
        },
      });
    }
  }
}

async function semearFornecedores() {
  const fornecedores = [
    {
      id: FORNECEDOR.AURORA,
      nome: 'Transportes Aurora',
      cnpj: '98765432000110',
    },
    {
      id: FORNECEDOR.ROTA_CERTA,
      nome: 'Rota Certa Mobilidade',
      cnpj: '45678912000155',
    },
  ];

  for (const fornecedor of fornecedores) {
    await prisma.fornecedor.upsert({
      where: { nCdFornecedor: fornecedor.id },
      update: { cNmFornecedor: fornecedor.nome, dDesativacao: null },
      create: {
        nCdFornecedor: fornecedor.id,
        cNmFornecedor: fornecedor.nome,
        cCNPJCPF: fornecedor.cnpj,
      },
    });
  }
}

async function semearContratos() {
  const contratos = [
    {
      id: 1,
      fornecedorId: FORNECEDOR.AURORA,
      bandeirada: BANDEIRADA,
      valorKm: VALOR_KM,
    },
    {
      id: 2,
      fornecedorId: FORNECEDOR.ROTA_CERTA,
      bandeirada: 9.0,
      valorKm: 3.4,
    },
  ];

  for (const contrato of contratos) {
    await prisma.contrato.upsert({
      where: { nCdContrato: contrato.id },
      update: { dVigenciaFim: null },
      create: {
        nCdContrato: contrato.id,
        cCaminhoArquivo: `contratos/contrato-${contrato.id}.pdf`,
        nCdUsuarioCadastro: USUARIO.ADMIN,
        dVigenciaInicio: DateTime.now().minus({ months: 6 }).toJSDate(),
      },
    });

    await prisma.filialFornecedor.upsert({
      where: {
        nCdFilial_nCdFornecedor_nCdContrato: {
          nCdFilial: FILIAL_ID,
          nCdFornecedor: contrato.fornecedorId,
          nCdContrato: contrato.id,
        },
      },
      update: {},
      create: {
        nCdFilial: FILIAL_ID,
        nCdFornecedor: contrato.fornecedorId,
        nCdContrato: contrato.id,
      },
    });

    for (const tipoCorridaId of Object.values(TIPO_CORRIDA)) {
      await prisma.modalidadeContrato.upsert({
        where: {
          nCdContrato_nCdTipoCorrida: {
            nCdContrato: contrato.id,
            nCdTipoCorrida: tipoCorridaId,
          },
        },
        update: {},
        create: {
          nCdContrato: contrato.id,
          nCdTipoCorrida: tipoCorridaId,
        },
      });
    }

    const regras = [
      { id: 1, prioridade: 1, tipoRegraId: 1, valorFixo: contrato.bandeirada },
      { id: 2, prioridade: 2, tipoRegraId: 2, valorKm: contrato.valorKm },
      { id: 3, prioridade: 3, tipoRegraId: 3, percentual: 20 },
      { id: 4, prioridade: 4, tipoRegraId: 4, valorFixo: 5 },
    ];

    for (const regra of regras) {
      await prisma.regra.upsert({
        where: {
          nCdContrato_nCdRegra: {
            nCdContrato: contrato.id,
            nCdRegra: regra.id,
          },
        },
        update: {
          iPrioridade: regra.prioridade,
          nValorFixo: regra.valorFixo ?? null,
          nValorKm: regra.valorKm ?? null,
          nPercentual: regra.percentual ?? null,
        },
        create: {
          nCdContrato: contrato.id,
          nCdRegra: regra.id,
          iPrioridade: regra.prioridade,
          nCdTipoRegra: regra.tipoRegraId,
          nValorFixo: regra.valorFixo ?? null,
          nValorKm: regra.valorKm ?? null,
          nPercentual: regra.percentual ?? null,
        },
      });
    }

    const condicoes = [
      { regraId: 3, id: 1, tipo: 'hora-inicio', valor: '22:00' },
      { regraId: 4, id: 1, tipo: 'quantidade-minima-paradas', valor: '1' },
    ];

    for (const condicao of condicoes) {
      await prisma.condicaoRegra.upsert({
        where: {
          nCdContrato_nCdRegra_nCdCondicao: {
            nCdContrato: contrato.id,
            nCdRegra: condicao.regraId,
            nCdCondicao: condicao.id,
          },
        },
        update: { cTipoCondicao: condicao.tipo, cValor: condicao.valor },
        create: {
          nCdContrato: contrato.id,
          nCdRegra: condicao.regraId,
          nCdCondicao: condicao.id,
          cTipoCondicao: condicao.tipo,
          cValor: condicao.valor,
        },
      });
    }
  }
}

async function semearVeiculos() {
  const veiculos = [
    { id: 1, placa: 'ABC1D23', tipo: TIPO_VEICULO.CARRO },
    { id: 2, placa: 'XYZ9K88', tipo: TIPO_VEICULO.MOTO },
  ];

  for (const veiculo of veiculos) {
    await prisma.veiculo.upsert({
      where: {
        nCdFornecedor_nCdVeiculo: {
          nCdFornecedor: FORNECEDOR.AURORA,
          nCdVeiculo: veiculo.id,
        },
      },
      update: { nCdTpVeiculo: veiculo.tipo, dDesativacao: null },
      create: {
        nCdFornecedor: FORNECEDOR.AURORA,
        nCdVeiculo: veiculo.id,
        nCdTpVeiculo: veiculo.tipo,
        cPlaca: veiculo.placa,
      },
    });
  }
}

interface SolicitacaoSeed {
  id: number;
  origem: PontoSeed;
  destino: PontoSeed;
  paradas?: PontoSeed[];
  dataCorrida: Date;
  tipoCorridaId: number;
  tipoVeiculoId: number;
  motivoId: number;
  status: string;
  centroCustoId: number;
  aprovadorId: number;
  statusAprovacao: string;
  motivoRecusaId?: number;
  passageiros: string[];
  corrida?: {
    id: number;
    status: string;
    finalizada: boolean;
    veiculoId: number;
  };
}

async function semearSolicitacoes() {
  const solicitacoes: SolicitacaoSeed[] = [
    {
      id: 1,
      origem: PONTO.CASA,
      destino: PONTO.AEROPORTO,
      dataCorrida: nestaSemana(2, 9, 30),
      tipoCorridaId: TIPO_CORRIDA.TAXI,
      tipoVeiculoId: TIPO_VEICULO.CARRO,
      motivoId: MOTIVO.VIAGEM_TRABALHO,
      status: 'A',
      centroCustoId: CENTRO_CUSTO.OPERACOES,
      aprovadorId: USUARIO.APROVADOR_OPERACOES,
      statusAprovacao: 'A',
      passageiros: [CPF.PASSAGEIRO],
    },
    {
      id: 2,
      origem: PONTO.CASA,
      destino: PONTO.CLIENTE_CENTRO,
      dataCorrida: nestaSemana(5, 14),
      tipoCorridaId: TIPO_CORRIDA.TAXI,
      tipoVeiculoId: TIPO_VEICULO.CARRO,
      motivoId: MOTIVO.VISITA_CLIENTE,
      status: 'A',
      centroCustoId: CENTRO_CUSTO.OPERACOES,
      aprovadorId: USUARIO.APROVADOR_OPERACOES,
      statusAprovacao: 'A',
      passageiros: [CPF.PASSAGEIRO],
      corrida: { id: 1, status: 'I', finalizada: false, veiculoId: 1 },
    },
    {
      id: 3,
      origem: PONTO.CASA,
      destino: PONTO.SHOPPING,
      paradas: [PONTO.PARADA_MAZZEI],
      dataCorrida: nestaSemana(5, 8),
      tipoCorridaId: TIPO_CORRIDA.TAXI,
      tipoVeiculoId: TIPO_VEICULO.VAN,
      motivoId: MOTIVO.REUNIAO_EXTERNA,
      status: 'P',
      centroCustoId: CENTRO_CUSTO.ADMINISTRATIVO,
      aprovadorId: USUARIO.APROVADOR_ADMINISTRATIVO,
      statusAprovacao: 'P',
      passageiros: [CPF.PASSAGEIRO, CPF.ACOMPANHANTE],
    },
    {
      id: 4,
      origem: PONTO.CASA,
      destino: PONTO.UNIVERSIDADE,
      dataCorrida: nestaSemana(3, 16),
      tipoCorridaId: TIPO_CORRIDA.TAXI,
      tipoVeiculoId: TIPO_VEICULO.CARRO,
      motivoId: MOTIVO.REUNIAO_EXTERNA,
      status: 'R',
      centroCustoId: CENTRO_CUSTO.LOGISTICA,
      aprovadorId: USUARIO.APROVADOR_LOGISTICA,
      statusAprovacao: 'R',
      motivoRecusaId: MOTIVO.RECUSA_FORA_POLITICA,
      passageiros: [CPF.PASSAGEIRO],
    },
    {
      id: 5,
      origem: PONTO.CASA,
      destino: PONTO.HOSPITAL,
      dataCorrida: semanaPassada(4, 10),
      tipoCorridaId: TIPO_CORRIDA.TAXI,
      tipoVeiculoId: TIPO_VEICULO.CARRO,
      motivoId: MOTIVO.EMERGENCIA,
      status: 'A',
      centroCustoId: CENTRO_CUSTO.OPERACOES,
      aprovadorId: USUARIO.APROVADOR_OPERACOES,
      statusAprovacao: 'A',
      passageiros: [CPF.PASSAGEIRO],
      corrida: { id: 2, status: 'F', finalizada: true, veiculoId: 1 },
    },
    {
      id: 7,
      origem: PONTO.CASA,
      destino: PONTO.CLIENTE_CENTRO,
      dataCorrida: semanaPassada(3, 9),
      tipoCorridaId: TIPO_CORRIDA.OBJETO,
      tipoVeiculoId: TIPO_VEICULO.MOTO,
      motivoId: MOTIVO.OBJ_ENCOMENDAS,
      status: 'A',
      centroCustoId: CENTRO_CUSTO.OPERACOES,
      aprovadorId: USUARIO.APROVADOR_OPERACOES,
      statusAprovacao: 'A',
      passageiros: [],
      corrida: { id: 3, status: 'F', finalizada: true, veiculoId: 2 },
    },
    {
      id: 6,
      origem: PONTO.CASA,
      destino: PONTO.CLIENTE_CENTRO,
      dataCorrida: nestaSemana(5, 15),
      tipoCorridaId: TIPO_CORRIDA.OBJETO,
      tipoVeiculoId: TIPO_VEICULO.MOTO,
      motivoId: MOTIVO.OBJ_DOCUMENTOS,
      status: 'P',
      centroCustoId: CENTRO_CUSTO.OPERACOES,
      aprovadorId: USUARIO.APROVADOR_OPERACOES,
      statusAprovacao: 'P',
      passageiros: [],
    },
  ];

  for (const solicitacao of solicitacoes) {
    const trajeto = [
      solicitacao.origem,
      ...(solicitacao.paradas ?? []),
      solicitacao.destino,
    ];
    const km = distanciaKm(trajeto);

    const dados = {
      nCdSolicitante: USUARIO.PASSAGEIRO,
      nCdFornecedor: FORNECEDOR.AURORA,
      dCorrida: solicitacao.dataCorrida,
      nDistanciaEstimada: km,
      nCdTipoCorrida: solicitacao.tipoCorridaId,
      nCdTpVeiculo: solicitacao.tipoVeiculoId,
      nCdEnderecoOrigem: solicitacao.origem.id,
      nCdEnderecoDestino: solicitacao.destino.id,
      nValorEstimado: valorEstimado(km),
      cStatus: solicitacao.status,
      nCdMotivoSolicitacao: solicitacao.motivoId,
    };

    await prisma.solicitacao.upsert({
      where: { nCdSolicitacao: solicitacao.id },
      update: dados,
      create: { nCdSolicitacao: solicitacao.id, ...dados },
    });

    let ordem = 1;

    for (const parada of solicitacao.paradas ?? []) {
      await prisma.parada.upsert({
        where: {
          nCdSolicitacao_iOrdem: {
            nCdSolicitacao: solicitacao.id,
            iOrdem: ordem,
          },
        },
        update: { nCdEndereco: parada.id },
        create: {
          nCdSolicitacao: solicitacao.id,
          iOrdem: ordem,
          nCdEndereco: parada.id,
          iTempoParadaMinutos: 15,
        },
      });

      ordem += 1;
    }

    await prisma.solicitacaoCentroCusto.upsert({
      where: {
        nCdSolicitacao_nCdFilial_nCdCentroCusto: {
          nCdSolicitacao: solicitacao.id,
          nCdFilial: FILIAL_ID,
          nCdCentroCusto: solicitacao.centroCustoId,
        },
      },
      update: {
        nCdAprovador: solicitacao.aprovadorId,
        cStatusAprovacao: solicitacao.statusAprovacao,
        nCdMotivoRecusa: solicitacao.motivoRecusaId ?? null,
      },
      create: {
        nCdSolicitacao: solicitacao.id,
        nCdFilial: FILIAL_ID,
        nCdCentroCusto: solicitacao.centroCustoId,
        nCdAprovador: solicitacao.aprovadorId,
        cStatusAprovacao: solicitacao.statusAprovacao,
        nCdMotivoRecusa: solicitacao.motivoRecusaId ?? null,
      },
    });

    for (const cpf of solicitacao.passageiros) {
      await prisma.solicitacaoPassageiro.upsert({
        where: {
          nCdSolicitacao_cCPF: { nCdSolicitacao: solicitacao.id, cCPF: cpf },
        },
        update: {},
        create: { nCdSolicitacao: solicitacao.id, cCPF: cpf },
      });
    }

    if (solicitacao.corrida) {
      const inicio = solicitacao.corrida.finalizada
        ? solicitacao.dataCorrida
        : DateTime.now().minus({ minutes: 20 }).toJSDate();
      const fim = solicitacao.corrida.finalizada
        ? DateTime.fromJSDate(inicio)
            .plus({ minutes: duracaoMinutos(km) })
            .toJSDate()
        : null;

      const dadosCorrida = {
        nCdSolicitacao: solicitacao.id,
        nCdMotorista: USUARIO.MOTORISTA,
        nCdFornecedor: FORNECEDOR.AURORA,
        nCdVeiculo: solicitacao.corrida.veiculoId,
        dInicioCorrida: inicio,
        dFimCorrida: fim,
        nKmPercorrido: solicitacao.corrida.finalizada ? km : 0,
        nValorFinal: solicitacao.corrida.finalizada ? valorEstimado(km) : 0,
        cStatus: solicitacao.corrida.status,
      };

      await prisma.corrida.upsert({
        where: { nCdCorrida: solicitacao.corrida.id },
        update: dadosCorrida,
        create: { nCdCorrida: solicitacao.corrida.id, ...dadosCorrida },
      });
    }
  }
}

async function main() {
  await semearCatalogos();
  await semearEnderecos();
  await semearFilialECentrosCusto();
  await semearFornecedores();
  await semearUsuarios();
  await semearContratos();
  await semearVeiculos();
  await semearSolicitacoes();

  console.log('Seed concluído.');
  console.log(`Senha de todos os usuários de teste: ${SENHA_PADRAO}`);
  console.log(`Passageiro: passageiro.teste@frota.com.br (CPF ${CPF.PASSAGEIRO})`);
  console.log(`Acompanhante para viagem compartilhada: CPF ${CPF.ACOMPANHANTE}`);
  console.log(
    `Centros de custo da filial ${FILIAL_ID}: ${Object.values(CENTRO_CUSTO).join(', ')}`,
  );
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
