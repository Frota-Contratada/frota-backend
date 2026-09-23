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

const FILIAL = {
  LONDRINA: 1,
  MARINGA: 2,
};

/** Filial usada pelas solicitações de demonstração criadas manualmente. */
const FILIAL_ID = FILIAL.LONDRINA;

const CENTRO_CUSTO = {
  OPERACOES: 101,
  ADMINISTRATIVO: 102,
  LOGISTICA: 103,
};

const CENTRO_CUSTO_MARINGA = {
  COMERCIAL: 201,
  SUPRIMENTOS: 202,
};

const USUARIO = {
  ADMIN: 1000,
  MOTORISTA: 1001,
  PASSAGEIRO: 1002,
  APROVADOR_OPERACOES: 1003,
  APROVADOR_ADMINISTRATIVO: 1004,
  APROVADOR_LOGISTICA: 1005,
  ACOMPANHANTE: 1006,
  ADMIN_FILIAL_LONDRINA: 1010,
  ADMIN_FILIAL_MARINGA: 1011,
  ADMIN_FORNECEDOR_AURORA: 1012,
  ADMIN_FORNECEDOR_ROTA_CERTA: 1013,
  ADMIN_FORNECEDOR_VIA_NORTE: 1014,
  MOTORISTA_AURORA_NOTURNO: 1015,
  MOTORISTA_ROTA_CERTA: 1016,
  MOTORISTA_VIA_NORTE: 1017,
  SOLICITANTE_LOGISTICA: 1020,
  SOLICITANTE_MARINGA: 1021,
  APROVADOR_COMERCIAL_MARINGA: 1022,
  APROVADOR_SUPRIMENTOS_MARINGA: 1023,
};

const CPF = {
  ADMIN: '10020030040',
  MOTORISTA: '99988877766',
  PASSAGEIRO: '11122233344',
  ACOMPANHANTE: '55566677788',
  APROVADOR_OPERACOES: '22233344455',
  APROVADOR_ADMINISTRATIVO: '33344455566',
  APROVADOR_LOGISTICA: '44455566677',
  ADMIN_FILIAL_LONDRINA: '12345678901',
  ADMIN_FILIAL_MARINGA: '12345678902',
  ADMIN_FORNECEDOR_AURORA: '90011122233',
  ADMIN_FORNECEDOR_ROTA_CERTA: '90022233344',
  ADMIN_FORNECEDOR_VIA_NORTE: '90033344455',
  MOTORISTA_AURORA_NOTURNO: '99911122233',
  MOTORISTA_ROTA_CERTA: '99922233344',
  MOTORISTA_VIA_NORTE: '99933344455',
  SOLICITANTE_LOGISTICA: '77711122233',
  SOLICITANTE_MARINGA: '77722233344',
  APROVADOR_COMERCIAL_MARINGA: '66611122233',
  APROVADOR_SUPRIMENTOS_MARINGA: '66622233344',
};

const TIPO_CORRIDA = {
  TRANSPORTE_PASSAGEIRO: 1,
  TRANSPORTE_OBJETO: 2,
  EMERGENCIAL: 3,
};
const TIPO_VEICULO = { MOTO: 1, CARRO: 2, VAN: 3 };
const FORNECEDOR = { AURORA: 1, ROTA_CERTA: 2, VIA_NORTE: 3 };
const CONTRATO = { AURORA: 1, ROTA_CERTA: 2, VIA_NORTE: 3 };

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
  FILIAL_MARINGA: {
    id: 9,
    logradouro: 'Avenida Colombo',
    numero: '5790',
    bairro: 'Zona 7',
    cidade: 'Maringá',
    uf: 'PR',
    cep: '87020900',
    latitude: -23.4053,
    longitude: -51.9331,
  },
  AEROPORTO_MARINGA: {
    id: 10,
    logradouro: 'Rodovia PR-317',
    numero: 'Km 10',
    bairro: 'Aeroporto',
    cidade: 'Maringá',
    uf: 'PR',
    cep: '87065005',
    latitude: -23.4763,
    longitude: -52.0161,
  },
  CENTRO_DISTRIBUICAO_MARINGA: {
    id: 11,
    logradouro: 'Avenida Tuiuti',
    numero: '1800',
    bairro: 'Zona 5',
    cidade: 'Maringá',
    uf: 'PR',
    cep: '87015100',
    latitude: -23.421,
    longitude: -51.949,
  },
  CLIENTE_MARINGA: {
    id: 12,
    logradouro: 'Avenida Brasil',
    numero: '4300',
    bairro: 'Zona 1',
    cidade: 'Maringá',
    uf: 'PR',
    cep: '87013000',
    latitude: -23.4253,
    longitude: -51.9386,
  },
  HOSPITAL_MARINGA: {
    id: 13,
    logradouro: 'Avenida Mandacaru',
    numero: '1590',
    bairro: 'Mandacaru',
    cidade: 'Maringá',
    uf: 'PR',
    cep: '87080000',
    latitude: -23.4034,
    longitude: -51.9128,
  },
} satisfies Record<string, PontoSeed>;

const RAIO_TERRA_KM = 6371;
const FATOR_RODOVIARIO = 1.3;
const VELOCIDADE_MEDIA_KMH = 50;

const BANDEIRADA = 7.5;
const VALOR_KM = 2.9;

/** Acréscimo da regra percentual dos contratos para corridas noturnas. */
const ADICIONAL_NOTURNO = 0.2;
const HORA_INICIO_NOTURNO = 22;

interface TarifaContrato {
  bandeirada: number;
  valorKm: number;
}

const CONTRATOS = [
  {
    id: CONTRATO.AURORA,
    fornecedorId: FORNECEDOR.AURORA,
    bandeirada: BANDEIRADA,
    valorKm: VALOR_KM,
    filiais: [FILIAL.LONDRINA, FILIAL.MARINGA],
  },
  {
    id: CONTRATO.ROTA_CERTA,
    fornecedorId: FORNECEDOR.ROTA_CERTA,
    bandeirada: 9.0,
    valorKm: 3.4,
    filiais: [FILIAL.LONDRINA, FILIAL.MARINGA],
  },
  {
    id: CONTRATO.VIA_NORTE,
    fornecedorId: FORNECEDOR.VIA_NORTE,
    bandeirada: 6.5,
    valorKm: 2.6,
    filiais: [FILIAL.LONDRINA, FILIAL.MARINGA],
  },
];

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
    {
      id: TIPO_CORRIDA.TRANSPORTE_PASSAGEIRO,
      nome: 'Transporte de passageiro',
    },
    { id: TIPO_CORRIDA.TRANSPORTE_OBJETO, nome: 'Transporte de objeto' },
    { id: TIPO_CORRIDA.EMERGENCIAL, nome: 'Emergencial' },
  ];

  for (const tipo of tiposCorrida) {
    await prisma.tipoCorrida.upsert({
      where: { nCdTipoCorrida: tipo.id },
      update: { cNmTipoCorrida: tipo.nome },
      create: { nCdTipoCorrida: tipo.id, cNmTipoCorrida: tipo.nome },
    });
  }

  const tiposVeiculo = [
    { id: TIPO_VEICULO.MOTO, nome: 'Moto', capacidadePassageiros: 1 },
    { id: TIPO_VEICULO.CARRO, nome: 'Carro', capacidadePassageiros: 4 },
    { id: TIPO_VEICULO.VAN, nome: 'Van', capacidadePassageiros: 15 },
  ];

  for (const tipo of tiposVeiculo) {
    await prisma.tipoVeiculo.upsert({
      where: { nCdTpVeiculo: tipo.id },
      update: {
        cNmTpVeiculo: tipo.nome,
        iQntPassageiros: tipo.capacidadePassageiros,
      },
      create: {
        nCdTpVeiculo: tipo.id,
        cNmTpVeiculo: tipo.nome,
        iQntPassageiros: tipo.capacidadePassageiros,
      },
    });
  }

  const motivos = [
    {
      id: MOTIVO.VIAGEM_TRABALHO,
      nome: 'Viagem de trabalho',
      tipo: TIPO_MOTIVO.SOLICITACAO,
    },
    {
      id: MOTIVO.REUNIAO_EXTERNA,
      nome: 'Reunião externa',
      tipo: TIPO_MOTIVO.SOLICITACAO,
    },
    {
      id: MOTIVO.VISITA_CLIENTE,
      nome: 'Visita a cliente',
      tipo: TIPO_MOTIVO.SOLICITACAO,
    },
    {
      id: MOTIVO.EMERGENCIA,
      nome: 'Emergência',
      tipo: TIPO_MOTIVO.SOLICITACAO,
    },
    {
      id: MOTIVO.CANCEL_MUDANCA_AGENDA,
      nome: 'Mudança de agenda',
      tipo: TIPO_MOTIVO.CANCELAMENTO,
    },
    {
      id: MOTIVO.CANCEL_NAO_PRECISO,
      nome: 'Não preciso mais da corrida',
      tipo: TIPO_MOTIVO.CANCELAMENTO,
    },
    {
      id: MOTIVO.CANCEL_ERRO,
      nome: 'Erro ao preencher a solicitação',
      tipo: TIPO_MOTIVO.CANCELAMENTO,
    },
    {
      id: MOTIVO.RECUSA_FORA_POLITICA,
      nome: 'Fora da política de viagens',
      tipo: TIPO_MOTIVO.RECUSA,
    },
    {
      id: MOTIVO.RECUSA_CC_INCORRETO,
      nome: 'Centro de custo incorreto',
      tipo: TIPO_MOTIVO.RECUSA,
    },
    {
      id: MOTIVO.RECUSA_SEM_VERBA,
      nome: 'Sem verba disponível',
      tipo: TIPO_MOTIVO.RECUSA,
    },
    { id: MOTIVO.OBJ_DOCUMENTOS, nome: 'Documentos', tipo: TIPO_MOTIVO.OBJETO },
    {
      id: MOTIVO.OBJ_EQUIPAMENTOS,
      nome: 'Equipamentos',
      tipo: TIPO_MOTIVO.OBJETO,
    },
    { id: MOTIVO.OBJ_ENCOMENDAS, nome: 'Encomendas', tipo: TIPO_MOTIVO.OBJETO },
    {
      id: MOTIVO.OBJ_MATERIAIS,
      nome: 'Materiais de escritório',
      tipo: TIPO_MOTIVO.OBJETO,
    },
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
    { id: 1, nome: 'VALOR_KM' },
    { id: 2, nome: 'VALOR_FIXO' },
    { id: 3, nome: 'PERCENTUAL' },
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

async function semearFiliaisECentrosCusto() {
  const filiais = [
    {
      id: FILIAL.LONDRINA,
      nome: 'Filial Londrina',
      cnpj: '12345678000190',
      enderecoId: PONTO.FILIAL.id,
      centrosCusto: [
        { id: CENTRO_CUSTO.OPERACOES, nome: 'Operações' },
        { id: CENTRO_CUSTO.ADMINISTRATIVO, nome: 'Administrativo' },
        { id: CENTRO_CUSTO.LOGISTICA, nome: 'Logística' },
      ],
    },
    {
      id: FILIAL.MARINGA,
      nome: 'Filial Maringá',
      cnpj: '12345678000271',
      enderecoId: PONTO.FILIAL_MARINGA.id,
      centrosCusto: [
        { id: CENTRO_CUSTO_MARINGA.COMERCIAL, nome: 'Comercial' },
        { id: CENTRO_CUSTO_MARINGA.SUPRIMENTOS, nome: 'Suprimentos' },
      ],
    },
  ];

  for (const filial of filiais) {
    await prisma.filial.upsert({
      where: { nCdFilial: filial.id },
      update: {
        cNmFilial: filial.nome,
        nCdEndereco: filial.enderecoId,
        dDesativacao: null,
      },
      create: {
        nCdFilial: filial.id,
        cNmFilial: filial.nome,
        cCNPJ: filial.cnpj,
        nCdEndereco: filial.enderecoId,
      },
    });

    for (const centroCusto of filial.centrosCusto) {
      await prisma.centroCusto.upsert({
        where: {
          nCdFilial_nCdCentroCusto: {
            nCdFilial: filial.id,
            nCdCentroCusto: centroCusto.id,
          },
        },
        update: { cNmCentroCusto: centroCusto.nome, dDesativacao: null },
        create: {
          nCdFilial: filial.id,
          nCdCentroCusto: centroCusto.id,
          cNmCentroCusto: centroCusto.nome,
        },
      });
    }
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
    {
      id: USUARIO.ADMIN_FILIAL_LONDRINA,
      nome: 'Fernanda Arruda',
      email: 'fernanda.arruda@frota.com.br',
      cargo: 'Administradora da filial',
      cpf: CPF.ADMIN_FILIAL_LONDRINA,
      filialId: FILIAL.LONDRINA,
      perfis: ['admin-filial'],
    },
    {
      id: USUARIO.ADMIN_FILIAL_MARINGA,
      nome: 'Gustavo Peixoto',
      email: 'gustavo.peixoto@frota.com.br',
      cargo: 'Administrador da filial',
      cpf: CPF.ADMIN_FILIAL_MARINGA,
      filialId: FILIAL.MARINGA,
      perfis: ['admin-filial'],
    },
    {
      id: USUARIO.ADMIN_FORNECEDOR_AURORA,
      nome: 'Helena Tavares',
      email: 'helena.tavares@transportesaurora.com.br',
      cargo: 'Gestora de frota',
      cpf: CPF.ADMIN_FORNECEDOR_AURORA,
      fornecedorId: FORNECEDOR.AURORA,
      perfis: ['admin-fornecedor'],
    },
    {
      id: USUARIO.ADMIN_FORNECEDOR_ROTA_CERTA,
      nome: 'Igor Salgado',
      email: 'igor.salgado@rotacerta.com.br',
      cargo: 'Gestor de frota',
      cpf: CPF.ADMIN_FORNECEDOR_ROTA_CERTA,
      fornecedorId: FORNECEDOR.ROTA_CERTA,
      perfis: ['admin-fornecedor'],
    },
    {
      id: USUARIO.ADMIN_FORNECEDOR_VIA_NORTE,
      nome: 'Juliana Freitas',
      email: 'juliana.freitas@vianorte.com.br',
      cargo: 'Gestora de frota',
      cpf: CPF.ADMIN_FORNECEDOR_VIA_NORTE,
      fornecedorId: FORNECEDOR.VIA_NORTE,
      perfis: ['admin-fornecedor'],
    },
    {
      id: USUARIO.MOTORISTA_AURORA_NOTURNO,
      nome: 'Marcos Vinícius Alves',
      email: 'marcos.alves@transportesaurora.com.br',
      cargo: 'Motorista',
      cpf: CPF.MOTORISTA_AURORA_NOTURNO,
      fornecedorId: FORNECEDOR.AURORA,
      perfis: ['motorista'],
    },
    {
      id: USUARIO.MOTORISTA_ROTA_CERTA,
      nome: 'Rafael Domingues',
      email: 'rafael.domingues@rotacerta.com.br',
      cargo: 'Motorista',
      cpf: CPF.MOTORISTA_ROTA_CERTA,
      fornecedorId: FORNECEDOR.ROTA_CERTA,
      perfis: ['motorista'],
    },
    {
      id: USUARIO.MOTORISTA_VIA_NORTE,
      nome: 'Tatiane Moraes',
      email: 'tatiane.moraes@vianorte.com.br',
      cargo: 'Motorista',
      cpf: CPF.MOTORISTA_VIA_NORTE,
      fornecedorId: FORNECEDOR.VIA_NORTE,
      perfis: ['motorista'],
    },
    {
      id: USUARIO.SOLICITANTE_LOGISTICA,
      nome: 'Bruno Cavalcanti',
      email: 'bruno.cavalcanti@frota.com.br',
      cargo: 'Analista de Suprimentos',
      cpf: CPF.SOLICITANTE_LOGISTICA,
      filialId: FILIAL.LONDRINA,
      centroCustoId: CENTRO_CUSTO.LOGISTICA,
      perfis: ['solicitante'],
    },
    {
      id: USUARIO.SOLICITANTE_MARINGA,
      nome: 'Larissa Antunes',
      email: 'larissa.antunes@frota.com.br',
      cargo: 'Executiva de Contas',
      cpf: CPF.SOLICITANTE_MARINGA,
      filialId: FILIAL.MARINGA,
      centroCustoId: CENTRO_CUSTO_MARINGA.COMERCIAL,
      perfis: ['solicitante'],
    },
    {
      id: USUARIO.APROVADOR_COMERCIAL_MARINGA,
      nome: 'Otávio Bastos',
      email: 'otavio.bastos@frota.com.br',
      cargo: 'Gerente Comercial',
      cpf: CPF.APROVADOR_COMERCIAL_MARINGA,
      filialId: FILIAL.MARINGA,
      centroCustoId: CENTRO_CUSTO_MARINGA.COMERCIAL,
      perfis: ['aprovador', 'solicitante'],
    },
    {
      id: USUARIO.APROVADOR_SUPRIMENTOS_MARINGA,
      nome: 'Patrícia Lemos',
      email: 'patricia.lemos@frota.com.br',
      cargo: 'Coordenadora de Suprimentos',
      cpf: CPF.APROVADOR_SUPRIMENTOS_MARINGA,
      filialId: FILIAL.MARINGA,
      centroCustoId: CENTRO_CUSTO_MARINGA.SUPRIMENTOS,
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
    {
      id: FORNECEDOR.VIA_NORTE,
      nome: 'Via Norte Transportes',
      cnpj: '32165498000177',
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
  const contratos = CONTRATOS;

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

    for (const filialId of contrato.filiais) {
      await prisma.filialFornecedor.upsert({
        where: {
          nCdFilial_nCdFornecedor_nCdContrato: {
            nCdFilial: filialId,
            nCdFornecedor: contrato.fornecedorId,
            nCdContrato: contrato.id,
          },
        },
        update: {},
        create: {
          nCdFilial: filialId,
          nCdFornecedor: contrato.fornecedorId,
          nCdContrato: contrato.id,
        },
      });
    }

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
      { id: 1, prioridade: 1, tipoRegraId: 2, valorFixo: contrato.bandeirada },
      { id: 2, prioridade: 2, tipoRegraId: 1, valorKm: contrato.valorKm },
      { id: 3, prioridade: 3, tipoRegraId: 3, percentual: 20 },
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
          nCdTipoRegra: regra.tipoRegraId,
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
    {
      fornecedorId: FORNECEDOR.AURORA,
      id: 1,
      placa: 'ABC1D23',
      tipo: TIPO_VEICULO.CARRO,
    },
    {
      fornecedorId: FORNECEDOR.AURORA,
      id: 2,
      placa: 'XYZ9K88',
      tipo: TIPO_VEICULO.MOTO,
    },
    {
      fornecedorId: FORNECEDOR.AURORA,
      id: 3,
      placa: 'AUR3V11',
      tipo: TIPO_VEICULO.VAN,
    },
    {
      fornecedorId: FORNECEDOR.ROTA_CERTA,
      id: 1,
      placa: 'RCT1A11',
      tipo: TIPO_VEICULO.CARRO,
    },
    {
      fornecedorId: FORNECEDOR.ROTA_CERTA,
      id: 2,
      placa: 'RCT2M22',
      tipo: TIPO_VEICULO.MOTO,
    },
    {
      fornecedorId: FORNECEDOR.ROTA_CERTA,
      id: 3,
      placa: 'RCT3V33',
      tipo: TIPO_VEICULO.VAN,
    },
    {
      fornecedorId: FORNECEDOR.VIA_NORTE,
      id: 1,
      placa: 'VNT1A44',
      tipo: TIPO_VEICULO.CARRO,
    },
    {
      fornecedorId: FORNECEDOR.VIA_NORTE,
      id: 2,
      placa: 'VNT2M55',
      tipo: TIPO_VEICULO.MOTO,
    },
    {
      fornecedorId: FORNECEDOR.VIA_NORTE,
      id: 3,
      placa: 'VNT3V66',
      tipo: TIPO_VEICULO.VAN,
    },
  ];

  for (const veiculo of veiculos) {
    await prisma.veiculo.upsert({
      where: {
        nCdFornecedor_nCdVeiculo: {
          nCdFornecedor: veiculo.fornecedorId,
          nCdVeiculo: veiculo.id,
        },
      },
      update: { nCdTpVeiculo: veiculo.tipo, dDesativacao: null },
      create: {
        nCdFornecedor: veiculo.fornecedorId,
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
      tipoCorridaId: TIPO_CORRIDA.TRANSPORTE_PASSAGEIRO,
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
      tipoCorridaId: TIPO_CORRIDA.TRANSPORTE_PASSAGEIRO,
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
      tipoCorridaId: TIPO_CORRIDA.TRANSPORTE_PASSAGEIRO,
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
      tipoCorridaId: TIPO_CORRIDA.TRANSPORTE_PASSAGEIRO,
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
      tipoCorridaId: TIPO_CORRIDA.EMERGENCIAL,
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
      tipoCorridaId: TIPO_CORRIDA.TRANSPORTE_OBJETO,
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
      tipoCorridaId: TIPO_CORRIDA.TRANSPORTE_OBJETO,
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
      nCdContrato: CONTRATO.AURORA,
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

// ---------------------------------------------------------------------------
// Histórico para os dashboards
//
// Os dashboards de admin master, admin de filial e aprovador leem corridas por
// período: sem filtro o período vai de 1º de janeiro até hoje, e a variação
// percentual dos cards compara com o mês anterior ao início do período. Por
// isso o histórico cobre de dezembro do ano passado até o mês atual.
//
// O sorteio é determinístico (mesma semente, mesmos dados), então rodar o seed
// novamente atualiza as mesmas solicitações em vez de duplicar o histórico.
// ---------------------------------------------------------------------------

const SEMENTE_HISTORICO = 20260101;
const PRIMEIRA_SOLICITACAO_HISTORICO = 2000;
const PRIMEIRA_CORRIDA_HISTORICO = 2000;
/**
 * Faixa de códigos reservada ao histórico. As solicitações de demonstração
 * (1 a 7) e as do seed aditivo (10001 em diante) ficam de fora.
 */
const ULTIMO_CODIGO_HISTORICO = 9999;
const CORRIDAS_POR_MES = { minimo: 9, maximo: 16 };
const SOLICITACOES_PENDENTES = 6;

type Sorteio = () => number;

/** Congruência linear simples: basta ser estável entre execuções. */
const criarSorteio = (semente: number): Sorteio => {
  let estado = semente >>> 0;

  return () => {
    estado = (Math.imul(estado, 1664525) + 1013904223) >>> 0;

    return estado / 0x1_0000_0000;
  };
};

const entre = (sortear: Sorteio, minimo: number, maximo: number): number =>
  minimo + sortear() * (maximo - minimo);

const inteiroEntre = (
  sortear: Sorteio,
  minimo: number,
  maximo: number,
): number => Math.floor(entre(sortear, minimo, maximo + 1));

const escolher = <T>(sortear: Sorteio, itens: T[]): T =>
  itens[Math.min(itens.length - 1, Math.floor(sortear() * itens.length))];

const ocorre = (sortear: Sorteio, probabilidade: number): boolean =>
  sortear() < probabilidade;

const escolherPorPeso = <T extends { peso: number }>(
  sortear: Sorteio,
  itens: T[],
): T => {
  const total = itens.reduce((soma, item) => soma + item.peso, 0);
  let acumulado = sortear() * total;

  for (const item of itens) {
    acumulado -= item.peso;
    if (acumulado <= 0) return item;
  }

  return itens[itens.length - 1];
};

const precoDoContrato = (
  tarifa: TarifaContrato,
  km: number,
  hora: number,
): number => {
  const base = tarifa.bandeirada + tarifa.valorKm * km;
  const adicional = hora >= HORA_INICIO_NOTURNO ? base * ADICIONAL_NOTURNO : 0;

  return Math.round((base + adicional) * 100) / 100;
};

interface FornecedorHistorico {
  fornecedorId: number;
  contratoId: number;
  tarifa: TarifaContrato;
  motoristas: number[];
  veiculoPorTipo: Record<number, number>;
  peso: number;
  /**
   * Faixa de razão entre km cobrado e km estimado. A auditoria classifica como
   * desvio alto a partir de 20%, então a Via Norte aparece como fornecedor em
   * risco e as demais ficam dentro do esperado.
   */
  desvioMinimo: number;
  desvioMaximo: number;
}

const FORNECEDORES_HISTORICO: FornecedorHistorico[] = [
  {
    fornecedorId: FORNECEDOR.AURORA,
    contratoId: CONTRATO.AURORA,
    tarifa: { bandeirada: BANDEIRADA, valorKm: VALOR_KM },
    motoristas: [USUARIO.MOTORISTA, USUARIO.MOTORISTA_AURORA_NOTURNO],
    veiculoPorTipo: {
      [TIPO_VEICULO.CARRO]: 1,
      [TIPO_VEICULO.MOTO]: 2,
      [TIPO_VEICULO.VAN]: 3,
    },
    peso: 45,
    desvioMinimo: 0.97,
    desvioMaximo: 1.09,
  },
  {
    fornecedorId: FORNECEDOR.ROTA_CERTA,
    contratoId: CONTRATO.ROTA_CERTA,
    tarifa: { bandeirada: 9.0, valorKm: 3.4 },
    motoristas: [USUARIO.MOTORISTA_ROTA_CERTA],
    veiculoPorTipo: {
      [TIPO_VEICULO.CARRO]: 1,
      [TIPO_VEICULO.MOTO]: 2,
      [TIPO_VEICULO.VAN]: 3,
    },
    peso: 35,
    desvioMinimo: 1.0,
    desvioMaximo: 1.16,
  },
  {
    fornecedorId: FORNECEDOR.VIA_NORTE,
    contratoId: CONTRATO.VIA_NORTE,
    tarifa: { bandeirada: 6.5, valorKm: 2.6 },
    motoristas: [USUARIO.MOTORISTA_VIA_NORTE],
    veiculoPorTipo: {
      [TIPO_VEICULO.CARRO]: 1,
      [TIPO_VEICULO.MOTO]: 2,
      [TIPO_VEICULO.VAN]: 3,
    },
    peso: 20,
    desvioMinimo: 1.18,
    desvioMaximo: 1.45,
  },
];

interface CentroCustoHistorico {
  centroCustoId: number;
  aprovadorId: number;
}

interface FilialHistorico {
  filialId: number;
  origem: PontoSeed;
  destinos: PontoSeed[];
  /** Destinos em outra cidade: corridas longas e caras, boas para os cards de gasto. */
  destinosIntermunicipais: PontoSeed[];
  centrosCusto: CentroCustoHistorico[];
  solicitantes: { id: number; cpf: string }[];
  cpfsPassageiros: string[];
}

const FILIAIS_HISTORICO: FilialHistorico[] = [
  {
    filialId: FILIAL.LONDRINA,
    origem: PONTO.FILIAL,
    destinos: [
      PONTO.AEROPORTO,
      PONTO.SHOPPING,
      PONTO.UNIVERSIDADE,
      PONTO.CLIENTE_CENTRO,
      PONTO.HOSPITAL,
      PONTO.CASA,
    ],
    destinosIntermunicipais: [
      PONTO.FILIAL_MARINGA,
      PONTO.CENTRO_DISTRIBUICAO_MARINGA,
    ],
    centrosCusto: [
      {
        centroCustoId: CENTRO_CUSTO.OPERACOES,
        aprovadorId: USUARIO.APROVADOR_OPERACOES,
      },
      {
        centroCustoId: CENTRO_CUSTO.ADMINISTRATIVO,
        aprovadorId: USUARIO.APROVADOR_ADMINISTRATIVO,
      },
      {
        centroCustoId: CENTRO_CUSTO.LOGISTICA,
        aprovadorId: USUARIO.APROVADOR_LOGISTICA,
      },
    ],
    solicitantes: [
      { id: USUARIO.PASSAGEIRO, cpf: CPF.PASSAGEIRO },
      { id: USUARIO.ACOMPANHANTE, cpf: CPF.ACOMPANHANTE },
      { id: USUARIO.SOLICITANTE_LOGISTICA, cpf: CPF.SOLICITANTE_LOGISTICA },
    ],
    cpfsPassageiros: [
      CPF.PASSAGEIRO,
      CPF.ACOMPANHANTE,
      CPF.SOLICITANTE_LOGISTICA,
      CPF.APROVADOR_OPERACOES,
    ],
  },
  {
    filialId: FILIAL.MARINGA,
    origem: PONTO.FILIAL_MARINGA,
    destinos: [
      PONTO.AEROPORTO_MARINGA,
      PONTO.CENTRO_DISTRIBUICAO_MARINGA,
      PONTO.CLIENTE_MARINGA,
      PONTO.HOSPITAL_MARINGA,
    ],
    destinosIntermunicipais: [PONTO.FILIAL, PONTO.AEROPORTO],
    centrosCusto: [
      {
        centroCustoId: CENTRO_CUSTO_MARINGA.COMERCIAL,
        aprovadorId: USUARIO.APROVADOR_COMERCIAL_MARINGA,
      },
      {
        centroCustoId: CENTRO_CUSTO_MARINGA.SUPRIMENTOS,
        aprovadorId: USUARIO.APROVADOR_SUPRIMENTOS_MARINGA,
      },
    ],
    solicitantes: [
      { id: USUARIO.SOLICITANTE_MARINGA, cpf: CPF.SOLICITANTE_MARINGA },
      {
        id: USUARIO.APROVADOR_COMERCIAL_MARINGA,
        cpf: CPF.APROVADOR_COMERCIAL_MARINGA,
      },
    ],
    cpfsPassageiros: [
      CPF.SOLICITANTE_MARINGA,
      CPF.APROVADOR_COMERCIAL_MARINGA,
      CPF.APROVADOR_SUPRIMENTOS_MARINGA,
    ],
  },
];

const MOTIVOS_POR_TIPO_CORRIDA: Record<number, number[]> = {
  [TIPO_CORRIDA.TRANSPORTE_PASSAGEIRO]: [
    MOTIVO.VIAGEM_TRABALHO,
    MOTIVO.REUNIAO_EXTERNA,
    MOTIVO.VISITA_CLIENTE,
  ],
  [TIPO_CORRIDA.TRANSPORTE_OBJETO]: [
    MOTIVO.OBJ_DOCUMENTOS,
    MOTIVO.OBJ_EQUIPAMENTOS,
    MOTIVO.OBJ_ENCOMENDAS,
    MOTIVO.OBJ_MATERIAIS,
    MOTIVO.OBJ_OUTROS,
  ],
  [TIPO_CORRIDA.EMERGENCIAL]: [MOTIVO.EMERGENCIA],
};

const MOTIVOS_CANCELAMENTO = [
  MOTIVO.CANCEL_MUDANCA_AGENDA,
  MOTIVO.CANCEL_NAO_PRECISO,
  MOTIVO.CANCEL_ERRO,
];

const MOTIVOS_RECUSA = [
  MOTIVO.RECUSA_FORA_POLITICA,
  MOTIVO.RECUSA_CC_INCORRETO,
  MOTIVO.RECUSA_SEM_VERBA,
];

type SituacaoHistorica = 'finalizada' | 'cancelada' | 'reprovada' | 'pendente';

interface CorridaHistorica {
  solicitacaoId: number;
  corridaId: number;
  filialId: number;
  fornecedor: FornecedorHistorico;
  solicitanteId: number;
  rateios: CentroCustoHistorico[];
  origem: PontoSeed;
  destino: PontoSeed;
  data: DateTime;
  tipoCorridaId: number;
  tipoVeiculoId: number;
  motoristaId: number;
  veiculoId: number;
  motivoId: number;
  motivoDesfechoId: number | null;
  passageiros: string[];
  situacao: SituacaoHistorica;
  kmEstimado: number;
  kmPercorrido: number;
  valorEstimado: number;
  valorFinal: number;
}

/** De dezembro do ano passado (base de comparação dos cards) até o mês atual. */
const mesesDoHistorico = (): DateTime[] => {
  const primeiro = DateTime.now().startOf('year').minus({ months: 1 });
  const ultimo = DateTime.now().startOf('month');
  const meses: DateTime[] = [];

  for (
    let mes = primeiro;
    mes.toMillis() <= ultimo.toMillis();
    mes = mes.plus({ months: 1 })
  ) {
    meses.push(mes);
  }

  return meses;
};

/** Momento dentro do mês, sempre no passado para o dashboard ter valor final. */
const sortearMomento = (sortear: Sorteio, mes: DateTime): DateTime => {
  const hoje = DateTime.now();
  const ehMesAtual = mes.hasSame(hoje, 'month') && mes.hasSame(hoje, 'year');
  const ultimoDia = ehMesAtual
    ? Math.max(1, hoje.day - 1)
    : (mes.daysInMonth ?? 28);
  const hora = ocorre(sortear, 0.12)
    ? inteiroEntre(sortear, HORA_INICIO_NOTURNO, 23)
    : inteiroEntre(sortear, 6, 20);

  return mes.set({
    day: inteiroEntre(sortear, 1, ultimoDia),
    hour: hora,
    minute: escolher(sortear, [0, 15, 30, 45]),
    second: 0,
    millisecond: 0,
  });
};

/** Data futura, para as solicitações que ainda esperam decisão do aprovador. */
const proximosDias = (sortear: Sorteio): DateTime =>
  DateTime.now()
    .plus({ days: inteiroEntre(sortear, 1, 7) })
    .set({
      hour: inteiroEntre(sortear, 7, 19),
      minute: escolher(sortear, [0, 15, 30, 45]),
      second: 0,
      millisecond: 0,
    });

const sortearTipoCorrida = (sortear: Sorteio): number => {
  const sorteado = sortear();

  if (sorteado < 0.64) return TIPO_CORRIDA.TRANSPORTE_PASSAGEIRO;
  if (sorteado < 0.9) return TIPO_CORRIDA.TRANSPORTE_OBJETO;

  return TIPO_CORRIDA.EMERGENCIAL;
};

const sortearSituacao = (sortear: Sorteio): SituacaoHistorica => {
  const sorteado = sortear();

  if (sorteado < 0.84) return 'finalizada';
  if (sorteado < 0.92) return 'cancelada';

  return 'reprovada';
};

const sortearPassageiros = (
  sortear: Sorteio,
  filial: FilialHistorico,
  cpfSolicitante: string,
): string[] => {
  const desejados = ocorre(sortear, 0.25) ? inteiroEntre(sortear, 2, 3) : 1;
  const quantidade = Math.min(desejados, filial.cpfsPassageiros.length);
  const cpfs = new Set<string>([cpfSolicitante]);

  while (cpfs.size < quantidade) {
    cpfs.add(escolher(sortear, filial.cpfsPassageiros));
  }

  return [...cpfs];
};

const sortearRateios = (
  sortear: Sorteio,
  filial: FilialHistorico,
): CentroCustoHistorico[] => {
  const principal = escolher(sortear, filial.centrosCusto);
  const outros = filial.centrosCusto.filter(
    (centro) => centro.centroCustoId !== principal.centroCustoId,
  );

  if (outros.length === 0 || !ocorre(sortear, 0.25)) return [principal];

  return [principal, escolher(sortear, outros)];
};

function sortearCorrida(
  sortear: Sorteio,
  data: DateTime,
  solicitacaoId: number,
  corridaId: number,
  situacaoForcada?: SituacaoHistorica,
): CorridaHistorica {
  const filial = escolher(sortear, FILIAIS_HISTORICO);
  const fornecedor = escolherPorPeso(sortear, FORNECEDORES_HISTORICO);
  const solicitante = escolher(sortear, filial.solicitantes);
  const destino = ocorre(sortear, 0.08)
    ? escolher(sortear, filial.destinosIntermunicipais)
    : escolher(sortear, filial.destinos);
  const tipoCorridaId = sortearTipoCorrida(sortear);
  const passageiros =
    tipoCorridaId === TIPO_CORRIDA.TRANSPORTE_OBJETO
      ? []
      : sortearPassageiros(sortear, filial, solicitante.cpf);
  const tipoVeiculoId =
    tipoCorridaId === TIPO_CORRIDA.TRANSPORTE_OBJETO
      ? TIPO_VEICULO.MOTO
      : passageiros.length >= 3
        ? TIPO_VEICULO.VAN
        : TIPO_VEICULO.CARRO;
  const situacao = situacaoForcada ?? sortearSituacao(sortear);
  const kmEstimado = distanciaKm([filial.origem, destino]);
  const kmPercorrido =
    situacao === 'finalizada'
      ? Math.round(
          kmEstimado *
            entre(sortear, fornecedor.desvioMinimo, fornecedor.desvioMaximo) *
            100,
        ) / 100
      : 0;

  return {
    solicitacaoId,
    corridaId,
    filialId: filial.filialId,
    fornecedor,
    solicitanteId: solicitante.id,
    rateios: sortearRateios(sortear, filial),
    origem: filial.origem,
    destino,
    data,
    tipoCorridaId,
    tipoVeiculoId,
    motoristaId: escolher(sortear, fornecedor.motoristas),
    veiculoId: fornecedor.veiculoPorTipo[tipoVeiculoId],
    motivoId: escolher(sortear, MOTIVOS_POR_TIPO_CORRIDA[tipoCorridaId]),
    motivoDesfechoId:
      situacao === 'cancelada'
        ? escolher(sortear, MOTIVOS_CANCELAMENTO)
        : situacao === 'reprovada'
          ? escolher(sortear, MOTIVOS_RECUSA)
          : null,
    passageiros,
    situacao,
    kmEstimado,
    kmPercorrido,
    valorEstimado: precoDoContrato(fornecedor.tarifa, kmEstimado, data.hour),
    valorFinal:
      situacao === 'finalizada'
        ? precoDoContrato(fornecedor.tarifa, kmPercorrido, data.hour)
        : 0,
  };
}

const STATUS_SOLICITACAO_HISTORICO: Record<SituacaoHistorica, string> = {
  finalizada: 'A',
  cancelada: 'C',
  reprovada: 'R',
  pendente: 'P',
};

const STATUS_APROVACAO_HISTORICO: Record<SituacaoHistorica, string> = {
  finalizada: 'A',
  cancelada: 'A',
  reprovada: 'R',
  pendente: 'P',
};

/** Só solicitação aprovada vira corrida; pendente e reprovada ficam sem. */
const geraCorrida = (situacao: SituacaoHistorica): boolean =>
  situacao === 'finalizada' || situacao === 'cancelada';

async function gravarCorridaHistorica(registro: CorridaHistorica) {
  const dados = {
    nCdSolicitante: registro.solicitanteId,
    nCdFornecedor: registro.fornecedor.fornecedorId,
    nCdContrato: registro.fornecedor.contratoId,
    dCriacao: registro.data.minus({ days: 2 }).toJSDate(),
    dCorrida: registro.data.toJSDate(),
    nDistanciaEstimada: registro.kmEstimado,
    nCdTipoCorrida: registro.tipoCorridaId,
    nCdTpVeiculo: registro.tipoVeiculoId,
    nCdEnderecoOrigem: registro.origem.id,
    nCdEnderecoDestino: registro.destino.id,
    nValorEstimado: registro.valorEstimado,
    cStatus: STATUS_SOLICITACAO_HISTORICO[registro.situacao],
    nCdMotivoSolicitacao: registro.motivoId,
    nCdMotivoCancelamento:
      registro.situacao === 'cancelada' ? registro.motivoDesfechoId : null,
  };

  await prisma.solicitacao.upsert({
    where: { nCdSolicitacao: registro.solicitacaoId },
    update: dados,
    create: { nCdSolicitacao: registro.solicitacaoId, ...dados },
  });

  for (const rateio of registro.rateios) {
    const aprovacao = {
      nCdAprovador: rateio.aprovadorId,
      cStatusAprovacao: STATUS_APROVACAO_HISTORICO[registro.situacao],
      nCdMotivoRecusa:
        registro.situacao === 'reprovada' ? registro.motivoDesfechoId : null,
    };

    await prisma.solicitacaoCentroCusto.upsert({
      where: {
        nCdSolicitacao_nCdFilial_nCdCentroCusto: {
          nCdSolicitacao: registro.solicitacaoId,
          nCdFilial: registro.filialId,
          nCdCentroCusto: rateio.centroCustoId,
        },
      },
      update: aprovacao,
      create: {
        nCdSolicitacao: registro.solicitacaoId,
        nCdFilial: registro.filialId,
        nCdCentroCusto: rateio.centroCustoId,
        ...aprovacao,
      },
    });
  }

  for (const cpf of registro.passageiros) {
    await prisma.solicitacaoPassageiro.upsert({
      where: {
        nCdSolicitacao_cCPF: {
          nCdSolicitacao: registro.solicitacaoId,
          cCPF: cpf,
        },
      },
      update: {},
      create: { nCdSolicitacao: registro.solicitacaoId, cCPF: cpf },
    });
  }

  if (!geraCorrida(registro.situacao)) return;

  const dadosCorrida = {
    nCdSolicitacao: registro.solicitacaoId,
    nCdMotorista: registro.motoristaId,
    nCdFornecedor: registro.fornecedor.fornecedorId,
    nCdVeiculo: registro.veiculoId,
    dInicioCorrida: registro.data.toJSDate(),
    dFimCorrida:
      registro.situacao === 'finalizada'
        ? registro.data
            .plus({ minutes: duracaoMinutos(registro.kmPercorrido) })
            .toJSDate()
        : null,
    nKmPercorrido: registro.kmPercorrido,
    nValorFinal: registro.valorFinal,
    cStatus: registro.situacao === 'finalizada' ? 'F' : 'C',
  };

  await prisma.corrida.upsert({
    where: { nCdCorrida: registro.corridaId },
    update: dadosCorrida,
    create: { nCdCorrida: registro.corridaId, ...dadosCorrida },
  });
}

/**
 * Apaga o histórico da execução anterior. Como a quantidade de corridas por mês
 * é sorteada, mudar o gerador deixaria registros órfãos de outra geração
 * misturados aos novos.
 */
async function limparHistorico() {
  const daCorrida = {
    nCdCorrida: {
      gte: PRIMEIRA_CORRIDA_HISTORICO,
      lte: ULTIMO_CODIGO_HISTORICO,
    },
  };
  const daSolicitacao = {
    nCdSolicitacao: {
      gte: PRIMEIRA_SOLICITACAO_HISTORICO,
      lte: ULTIMO_CODIGO_HISTORICO,
    },
  };

  await prisma.despesaCorrida.deleteMany({ where: daCorrida });
  await prisma.recusaCorrida.deleteMany({ where: daCorrida });
  await prisma.regraCorrida.deleteMany({ where: daCorrida });
  await prisma.corrida.deleteMany({ where: daCorrida });

  await prisma.solicitacaoResposta.deleteMany({ where: daSolicitacao });
  await prisma.solicitacaoPassageiro.deleteMany({ where: daSolicitacao });
  await prisma.solicitacaoCentroCusto.deleteMany({ where: daSolicitacao });
  await prisma.parada.deleteMany({ where: daSolicitacao });
  await prisma.solicitacao.deleteMany({ where: daSolicitacao });
}

async function semearHistorico(): Promise<number> {
  await limparHistorico();

  const sortear = criarSorteio(SEMENTE_HISTORICO);
  let solicitacaoId = PRIMEIRA_SOLICITACAO_HISTORICO;
  let corridaId = PRIMEIRA_CORRIDA_HISTORICO;

  for (const mes of mesesDoHistorico()) {
    const quantidade = inteiroEntre(
      sortear,
      CORRIDAS_POR_MES.minimo,
      CORRIDAS_POR_MES.maximo,
    );

    for (let indice = 0; indice < quantidade; indice += 1) {
      const registro = sortearCorrida(
        sortear,
        sortearMomento(sortear, mes),
        solicitacaoId,
        corridaId,
      );

      await gravarCorridaHistorica(registro);

      solicitacaoId += 1;
      if (geraCorrida(registro.situacao)) corridaId += 1;
    }
  }

  // Solicitações dos próximos dias aguardando decisão dos aprovadores.
  for (let indice = 0; indice < SOLICITACOES_PENDENTES; indice += 1) {
    const registro = sortearCorrida(
      sortear,
      proximosDias(sortear),
      solicitacaoId,
      corridaId,
      'pendente',
    );

    await gravarCorridaHistorica(registro);

    solicitacaoId += 1;
  }

  return solicitacaoId - PRIMEIRA_SOLICITACAO_HISTORICO;
}

async function main() {
  await semearCatalogos();
  await semearEnderecos();
  await semearFiliaisECentrosCusto();
  await semearFornecedores();
  await semearUsuarios();
  await semearContratos();
  await semearVeiculos();
  await semearSolicitacoes();

  const solicitacoesHistoricas = await semearHistorico();

  console.log('Seed concluído.');
  console.log(`Senha de todos os usuários de teste: ${SENHA_PADRAO}`);
  console.log('');
  console.log('Acessos por perfil:');
  console.log('  admin-master:      admin.master@frota.com.br');
  console.log('  admin-filial:      fernanda.arruda@frota.com.br (Londrina)');
  console.log('                     gustavo.peixoto@frota.com.br (Maringá)');
  console.log('  aprovador:         carla.nogueira@frota.com.br (Operações)');
  console.log('                     diego.prado@frota.com.br (Administrativo)');
  console.log('                     eduarda.lima@frota.com.br (Logística)');
  console.log('                     otavio.bastos@frota.com.br (Comercial)');
  console.log('                     patricia.lemos@frota.com.br (Suprimentos)');
  console.log('  admin-fornecedor:  helena.tavares@transportesaurora.com.br');
  console.log('                     igor.salgado@rotacerta.com.br');
  console.log('                     juliana.freitas@vianorte.com.br');
  console.log('  solicitante:       passageiro.teste@frota.com.br');
  console.log('                     bruno.cavalcanti@frota.com.br');
  console.log('                     larissa.antunes@frota.com.br (Maringá)');
  console.log('  motorista:         motorista.teste@frota.com.br');
  console.log('');
  console.log(
    `Passageiro: passageiro.teste@frota.com.br (CPF ${CPF.PASSAGEIRO})`,
  );
  console.log(
    `Acompanhante para viagem compartilhada: CPF ${CPF.ACOMPANHANTE}`,
  );
  console.log(
    `Centros de custo da filial ${FILIAL.LONDRINA}: ${Object.values(CENTRO_CUSTO).join(', ')}`,
  );
  console.log(
    `Centros de custo da filial ${FILIAL.MARINGA}: ${Object.values(CENTRO_CUSTO_MARINGA).join(', ')}`,
  );
  console.log(
    `Histórico para os dashboards: ${solicitacoesHistoricas} solicitações de dezembro do ano passado até hoje.`,
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
