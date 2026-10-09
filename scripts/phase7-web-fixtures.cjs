#!/usr/bin/env node
// Synthetic HML Web fixtures only. Corporate organization and supplier rows are read-only.
const { mkdir, readFile, rm, writeFile } = require('node:fs/promises');
const { resolve, relative, sep } = require('node:path');

const MARK = 'PHASE7-WEB';
const COMPANY = 30;
const BRANCH = 704;
const CENTER = 4704;
const ID = Object.freeze({
  address: [9001, 9002], motive: [9001, 9002, 9003],
  contract: [9001, 9002, 9003], user: [9001, 9002, 9003],
  vehicle: [9001, 9002, 9003],
  request: Array.from({ length: 31 }, (_, i) => 9001 + i),
  ride: Array.from({ length: 24 }, (_, i) => 9001 + i),
});
const accounts = [
  'admin.master@frota.com.br', 'aprovador@frota.com.br',
  'solicitante@frota.com.br', 'motorista@frota.com.br',
];
const supplierKeys = [
  [1665323, 1], [9174938, 1],
];
const catalog = Object.freeze({
  tipoCorrida: [
    { nCdTipoCorrida: 1, cNmTipoCorrida: 'Transporte de passageiro' },
    { nCdTipoCorrida: 2, cNmTipoCorrida: 'Transporte de objeto' },
    { nCdTipoCorrida: 3, cNmTipoCorrida: 'Emergencial' },
  ],
  tipoVeiculo: [
    { nCdTpVeiculo: 1, cNmTpVeiculo: 'Moto', iQntPassageiros: 1 },
    { nCdTpVeiculo: 2, cNmTpVeiculo: 'Carro', iQntPassageiros: 4 },
    { nCdTpVeiculo: 3, cNmTpVeiculo: 'Van', iQntPassageiros: 15 },
  ],
  tipoRegra: [
    { nCdTipoRegra: 1, cNmRegra: 'Valor por km' },
    { nCdTipoRegra: 2, cNmRegra: 'Valor fixo' },
    { nCdTipoRegra: 3, cNmRegra: 'Percentual' },
  ],
});

function parseArgs(argv) {
  const result = { mode: 'dry-run' };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (['--dry-run', '--apply', '--reset'].includes(token)) result.mode = token.slice(2);
    else if (['--expect-host', '--expect-database'].includes(token)) result[token.slice(2)] = argv[++i];
    else throw new Error('Unknown fixture option');
  }
  if (result.mode !== 'dry-run' && (!result['expect-host'] || !result['expect-database'])) {
    throw new Error('Mutations require --expect-host and --expect-database');
  }
  return result;
}

function databaseTarget(url) {
  const host = /^sqlserver:\/\/([^:;/]+)/i.exec(url)?.[1];
  const database = /(?:^|;)database=([^;]+)/i.exec(url)?.[1];
  if (!host || !database) throw new Error('Invalid database target');
  return { host, database };
}

function sameFields(actual, expected) {
  return Object.entries(expected).every(([key, value]) => {
    const previous = actual[key];
    if (previous == null || value == null) return previous == null && value == null;
    if (previous instanceof Date && value instanceof Date) return previous.getTime() === value.getTime();
    return String(previous) === String(value);
  });
}

function assertOwned(row, expected, label) {
  if (row && !sameFields(row, expected)) throw new Error(`Reserved fixture collision: ${label}`);
}

function pdfBytes(title) {
  const safe = title.replace(/[^A-Za-z0-9 -]/g, '');
  const lines = [
    '%PDF-1.4\n',
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj\n',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n',
  ];
  const stream = [
    `BT /F1 18 Tf 50 770 Td (${safe}) Tj ET`,
    'BT /F1 11 Tf 50 740 Td (Synthetic document for HML Web validation only.) Tj ET',
    'BT /F1 11 Tf 50 720 Td (Start date: 01/09/2026. End date: 31/12/2027.) Tj ET',
    'BT /F1 11 Tf 50 700 Td (Fixed fare: BRL 8.50. Price per km: BRL 3.00.) Tj ET',
  ].join('\n') + '\n';
  lines.push(`5 0 obj << /Length ${Buffer.byteLength(stream)} >> stream\n${stream}endstream endobj\n`);
  let content = lines[0], offsets = [0];
  for (const line of lines.slice(1)) { offsets.push(Buffer.byteLength(content)); content += line; }
  const xref = Buffer.byteLength(content);
  content += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map((x) => String(x).padStart(10, '0') + ' 00000 n \n').join('')}`;
  content += `trailer << /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(content, 'ascii');
}

function storagePath(key) {
  const baseSetting = process.env.STORAGE_CAMINHO_BASE;
  if (!baseSetting) throw new Error('STORAGE_CAMINHO_BASE is required for fixture PDFs');
  const base = resolve(process.cwd(), baseSetting);
  const path = resolve(base, key);
  if (!relative(base, path) || relative(base, path).startsWith('..' + sep)) {
    throw new Error('Invalid fixture storage path');
  }
  return path;
}

async function ensurePdfs() {
  for (let i = 0; i < ID.contract.length; i++) {
    const path = storagePath(`contratos/phase7-web-${i + 1}.pdf`);
    const expected = pdfBytes(`PHASE7 WEB CONTRACT ${i + 1}`);
    await mkdir(resolve(path, '..'), { recursive: true });
    try { await writeFile(path, expected, { flag: 'wx', mode: 0o644 }); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
    const actual = await readFile(path);
    if (!actual.equals(expected)) throw new Error('Fixture PDF path has unexpected content');
  }
}

async function removePdfs() {
  for (let i = 0; i < ID.contract.length; i++) {
    const path = storagePath(`contratos/phase7-web-${i + 1}.pdf`);
    let actual;
    try { actual = await readFile(path); }
    catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    if (!actual.equals(pdfBytes(`PHASE7 WEB CONTRACT ${i + 1}`))) {
      throw new Error('Refusing to remove modified fixture PDF');
    }
    await rm(path);
  }
}

async function dependencies(prisma) {
  const [branch, center, users, suppliers] = await Promise.all([
    prisma.filial.findUnique({ where: { nCdEmpresa_nCdFilial: { nCdEmpresa: COMPANY, nCdFilial: BRANCH } } }),
    prisma.centroCusto.findUnique({ where: { nCdEmpresa_nCdFilial_nCdCentroCusto: { nCdEmpresa: COMPANY, nCdFilial: BRANCH, nCdCentroCusto: CENTER } } }),
    prisma.usuario.findMany({ where: { cEmail: { in: accounts } }, select: { nCdUsuario: true, cEmail: true, nCdEmpresa: true, nCdFilial: true, nCdFornecedor: true } }),
    prisma.fornecedor.findMany({ where: { OR: supplierKeys.map(([nCdBaseFornecedor, nCdEstabFornecedor]) => ({ nCdBaseFornecedor, nCdEstabFornecedor })) }, select: { nCdFornecedor: true, nCdBaseFornecedor: true, nCdEstabFornecedor: true } }),
  ]);
  if (!branch || !center || users.length !== accounts.length || suppliers.length !== supplierKeys.length) {
    throw new Error('Approved HML fixture dependencies are missing');
  }
  const user = Object.fromEntries(users.map((x) => [x.cEmail, Number(x.nCdUsuario)]));
  const supplier = Object.fromEntries(suppliers.map((x) => [Number(x.nCdBaseFornecedor), Number(x.nCdFornecedor)]));
  const branchAdmin = users.find((x) => x.cEmail === 'solicitante@frota.com.br');
  if (Number(branchAdmin.nCdEmpresa) !== COMPANY || Number(branchAdmin.nCdFilial) !== BRANCH ||
      Number(users.find((x) => x.cEmail === 'motorista@frota.com.br').nCdFornecedor) !== supplier[1665323]) {
    throw new Error('Approved accounts no longer match the HML scope');
  }
  return { user, supplier };
}

function fixtureRows(ref, now = new Date()) {
  const past = (days) => new Date(now.getTime() - days * 86400000);
  const future = (days) => new Date(now.getTime() + days * 86400000);
  const addresses = [
    { nCdEndereco: ID.address[0], cEndereco: 'Rua Ficticia Phase 7 Origem', cNumero: '100', cComplemento: MARK, cBairro: 'Centro', cCidade: 'Rolandia', cUf: 'PR', cCEP: '86600000', nLatitude: -23.310000, nLongitude: -51.360000 },
    { nCdEndereco: ID.address[1], cEndereco: 'Rua Ficticia Phase 7 Destino', cNumero: '200', cComplemento: MARK, cBairro: 'Centro', cCidade: 'Rolandia', cUf: 'PR', cCEP: '86600000', nLatitude: -23.320000, nLongitude: -51.370000 },
  ];
  const motives = [
    { nCdMotivo: ID.motive[0], nCdEmpresa: COMPANY, nCdFilial: BRANCH, cNmMotivo: `${MARK} - Viagem de trabalho`, cTipoMotivo: '1' },
    { nCdMotivo: ID.motive[1], nCdEmpresa: COMPANY, nCdFilial: BRANCH, cNmMotivo: `${MARK} - Cancelamento`, cTipoMotivo: '2' },
    { nCdMotivo: ID.motive[2], nCdEmpresa: COMPANY, nCdFilial: BRANCH, cNmMotivo: `${MARK} - Recusa`, cTipoMotivo: '3' },
  ];
  const contracts = ID.contract.map((id, i) => ({
    nCdContrato: id, cCaminhoArquivo: `contratos/phase7-web-${i + 1}.pdf`,
    nCdUsuarioCadastro: ref.user['admin.master@frota.com.br'],
    dVigenciaInicio: i === 2 ? past(120) : past(30),
    dVigenciaFim: i === 2 ? past(15) : i === 1 ? future(20) : future(365),
    cSituacao: 'publicado',
  }));
  const drivers = [
    { nCdUsuario: ID.user[0], cNmUsuario: `${MARK} - Motorista auxiliar`, cEmail: 'phase7-driver-active@frota.invalid', cCPF: '12345678909', cDisponivel: 'S', nCdFornecedor: ref.supplier[1665323], dAtivacao: past(30) },
    { nCdUsuario: ID.user[1], cNmUsuario: `${MARK} - Motorista inativo`, cEmail: 'phase7-driver-inactive@frota.invalid', cCPF: '11144477735', cDisponivel: 'N', nCdFornecedor: ref.supplier[1665323], dAtivacao: past(60), dDesativacao: past(10) },
    { nCdUsuario: ID.user[2], cNmUsuario: `${MARK} - Motorista fornecedor auxiliar`, cEmail: 'phase7-driver-secondary@frota.invalid', cCPF: '52998224725', cDisponivel: 'S', nCdFornecedor: ref.supplier[9174938], dAtivacao: past(30) },
  ];
  const vehicles = [
    { nCdFornecedor: ref.supplier[1665323], nCdVeiculo: ID.vehicle[0], nCdTpVeiculo: 2, cPlaca: 'HML7A01', dAtivacao: past(30) },
    { nCdFornecedor: ref.supplier[1665323], nCdVeiculo: ID.vehicle[1], nCdTpVeiculo: 3, cPlaca: 'HML7V02', dAtivacao: past(30) },
    { nCdFornecedor: ref.supplier[1665323], nCdVeiculo: ID.vehicle[2], nCdTpVeiculo: 1, cPlaca: 'HML7M03', dAtivacao: past(30), dDesativacao: past(10) },
  ];
  const requests = ID.request.map((id, i) => {
    const status = i < 3 ? 'P' : i < 5 ? 'R' : i < 7 ? 'C' : 'A';
    const rideDate = i < 9 ? future(i - 5) : i < 11 ? now : past(Math.max(1, 31 - i));
    return {
      nCdSolicitacao: id, nCdSolicitante: ref.user['solicitante@frota.com.br'],
      nCdFornecedor: ref.supplier[i % 6 === 0 ? 9174938 : 1665323],
      nCdContrato: i % 6 === 0 ? ID.contract[1] : ID.contract[0],
      dCriacao: past(35 - i), dCorrida: rideDate,
      nDistanciaEstimada: 4 + i / 10, nCdTipoCorrida: 1,
      nCdEnderecoOrigem: ID.address[0], nCdEnderecoDestino: ID.address[1],
      nCdTpVeiculo: i % 6 === 0 ? 2 : i % 5 === 0 ? 3 : 2,
      nValorEstimado: 20 + i * 3, cStatus: status,
      nCdMotivoSolicitacao: ID.motive[0],
      nCdMotivoCancelamento: status === 'C' ? ID.motive[1] : null,
    };
  });
  const rides = ID.ride.map((id, i) => {
    const request = requests[i + 7];
    const status = i < 2 ? 'A' : i < 4 ? 'I' : i < 22 ? 'F' : 'C';
    return {
      nCdCorrida: id, nCdSolicitacao: request.nCdSolicitacao,
      nCdMotorista: request.nCdFornecedor === ref.supplier[9174938] ? ID.user[2] : i % 2 ? ID.user[0] : ref.user['motorista@frota.com.br'],
      nCdFornecedor: request.nCdFornecedor,
      nCdVeiculo: request.nCdFornecedor === ref.supplier[1665323] ? (request.nCdTpVeiculo === 3 ? ID.vehicle[1] : ID.vehicle[0]) : ID.vehicle[0],
      dInicioCorrida: request.dCorrida, dFimCorrida: status === 'F' ? new Date(request.dCorrida.getTime() + 1800000) : null,
      nKmPercorrido: 4 + i / 10, nValorFinal: 20 + i * 3,
      cStatus: status,
    };
  });
  // Auxiliary supplier needs its own vehicle; the row is added below.
  vehicles.push({ nCdFornecedor: ref.supplier[9174938], nCdVeiculo: ID.vehicle[0], nCdTpVeiculo: 2, cPlaca: 'HML7B04', dAtivacao: past(30) });
  return { addresses, motives, contracts, drivers, vehicles, requests, rides };
}

async function examine(prisma, rows, ref) {
  const found = {};
  for (const [model, key, items, fingerprint] of [
    ['endereco', 'nCdEndereco', rows.addresses, (x) => ({ cComplemento: x.cComplemento })],
    ['motivo', 'nCdMotivo', rows.motives, (x) => ({ cNmMotivo: x.cNmMotivo })],
    ['contrato', 'nCdContrato', rows.contracts, (x) => ({ cCaminhoArquivo: x.cCaminhoArquivo })],
    ['usuario', 'nCdUsuario', rows.drivers, (x) => ({ cEmail: x.cEmail, cNmUsuario: x.cNmUsuario })],
    ['solicitacao', 'nCdSolicitacao', rows.requests, (x) => ({ nCdSolicitante: x.nCdSolicitante, nCdContrato: x.nCdContrato })],
    ['corrida', 'nCdCorrida', rows.rides, (x) => ({ nCdSolicitacao: x.nCdSolicitacao })],
  ]) {
    const current = await prisma[model].findMany({ where: { [key]: { in: items.map((x) => x[key]) } } });
    const byId = new Map(items.map((x) => [Number(x[key]), x]));
    current.forEach((x) => assertOwned(x, fingerprint(byId.get(Number(x[key]))), `${model} ${x[key]}`));
    found[model] = { total: items.length, present: current.length, missing: items.length - current.length };
  }
  for (const [model, key, items, fingerprint] of [
    ['tipoCorrida', 'nCdTipoCorrida', catalog.tipoCorrida, (x) => ({ cNmTipoCorrida: x.cNmTipoCorrida })],
    ['tipoVeiculo', 'nCdTpVeiculo', catalog.tipoVeiculo, (x) => ({ cNmTpVeiculo: x.cNmTpVeiculo, iQntPassageiros: x.iQntPassageiros })],
    ['tipoRegra', 'nCdTipoRegra', catalog.tipoRegra, (x) => ({ cNmRegra: x.cNmRegra })],
  ]) {
    const current = await prisma[model].findMany({ where: { [key]: { in: items.map((x) => x[key]) } } });
    const byId = new Map(items.map((x) => [Number(x[key]), x]));
    current.forEach((x) => assertOwned(x, fingerprint(byId.get(Number(x[key]))), `${model} ${x[key]}`));
    found[model] = { total: items.length, present: current.length, missing: items.length - current.length };
  }
  const vehiclePresent = await prisma.veiculo.findMany({ where: { OR: rows.vehicles.map(({ nCdFornecedor, nCdVeiculo }) => ({ nCdFornecedor, nCdVeiculo })) } });
  for (const vehicle of vehiclePresent) {
    const expected = rows.vehicles.find((x) => Number(x.nCdFornecedor) === Number(vehicle.nCdFornecedor) && x.nCdVeiculo === Number(vehicle.nCdVeiculo));
    assertOwned(vehicle, { cPlaca: expected.cPlaca }, 'veiculo');
  }
  found.veiculo = { total: rows.vehicles.length, present: vehiclePresent.length, missing: rows.vehicles.length - vehiclePresent.length };
  for (const [model, where, total] of [
    ['filialFornecedor', { nCdContrato: { in: ID.contract } }, ID.contract.length],
    ['modalidadeContrato', { nCdContrato: { in: ID.contract } }, ID.contract.length],
    ['regra', { nCdContrato: { in: ID.contract } }, ID.contract.length * 2],
    ['solicitacaoCentroCusto', { nCdSolicitacao: { in: ID.request } }, ID.request.length],
    ['usuarioPerfil', { nCdUsuario: { in: ID.user } }, ID.user.length],
  ]) {
    const present = await prisma[model].count({ where });
    found[model] = { total, present, missing: Math.max(0, total - present), extra: Math.max(0, present - total) };
  }
  const outOfRange = await prisma.corrida.count({ where: { nCdSolicitacao: { in: ID.request }, nCdCorrida: { notIn: ID.ride } } });
  if (outOfRange) throw new Error('Fixture requests have non-fixture rides; reset is unsafe');
  return found;
}

async function createMissing(tx, model, key, rows) {
  let created = 0;
  for (const row of rows) {
    const where = key(row);
    if (!await tx[model].findUnique({ where })) { await tx[model].create({ data: row }); created++; }
  }
  return created;
}

async function apply(prisma, rows, ref) {
  await ensurePdfs();
  const created = await prisma.$transaction(async (tx) => {
    const result = {};
    for (const [model, key, items] of [
      ['tipoCorrida', (x) => ({ nCdTipoCorrida: x.nCdTipoCorrida }), catalog.tipoCorrida],
      ['tipoVeiculo', (x) => ({ nCdTpVeiculo: x.nCdTpVeiculo }), catalog.tipoVeiculo],
      ['tipoRegra', (x) => ({ nCdTipoRegra: x.nCdTipoRegra }), catalog.tipoRegra],
      ['endereco', (x) => ({ nCdEndereco: x.nCdEndereco }), rows.addresses],
      ['motivo', (x) => ({ nCdMotivo: x.nCdMotivo }), rows.motives],
      ['contrato', (x) => ({ nCdContrato: x.nCdContrato }), rows.contracts],
      ['usuario', (x) => ({ nCdUsuario: x.nCdUsuario }), rows.drivers],
    ]) result[model] = await createMissing(tx, model, key, items);
    result.usuarioPerfil = await createMissing(tx, 'usuarioPerfil',
      (x) => ({ nCdUsuario_cTipoPerfil: { nCdUsuario: x.nCdUsuario, cTipoPerfil: x.cTipoPerfil } }),
      ID.user.map((nCdUsuario) => ({ nCdUsuario, cTipoPerfil: 'motorista', dInicioVigencia: rows.drivers[0].dAtivacao })));
    result.veiculo = await createMissing(tx, 'veiculo',
      (x) => ({ nCdFornecedor_nCdVeiculo: { nCdFornecedor: x.nCdFornecedor, nCdVeiculo: x.nCdVeiculo } }), rows.vehicles);
    const links = ID.contract.map((nCdContrato, i) => ({ nCdEmpresa: COMPANY, nCdFilial: BRANCH, nCdFornecedor: ref.supplier[i === 1 ? 9174938 : 1665323], nCdContrato }));
    result.filialFornecedor = await createMissing(tx, 'filialFornecedor',
      (x) => ({ nCdEmpresa_nCdFilial_nCdFornecedor_nCdContrato: x }), links);
    result.modalidadeContrato = await createMissing(tx, 'modalidadeContrato',
      (x) => ({ nCdContrato_nCdTipoCorrida: x }), ID.contract.map((nCdContrato) => ({ nCdContrato, nCdTipoCorrida: 1 })));
    result.regra = await createMissing(tx, 'regra',
      (x) => ({ nCdContrato_nCdRegra: { nCdContrato: x.nCdContrato, nCdRegra: x.nCdRegra } }),
      ID.contract.flatMap((nCdContrato) => [
        { nCdContrato, nCdRegra: 1, iPrioridade: 1, nCdTipoRegra: 2, nValorFixo: 8.5 },
        { nCdContrato, nCdRegra: 2, iPrioridade: 2, nCdTipoRegra: 1, nValorKm: 3 },
      ]));
    result.solicitacao = await createMissing(tx, 'solicitacao',
      (x) => ({ nCdSolicitacao: x.nCdSolicitacao }), rows.requests);
    result.solicitacaoCentroCusto = await createMissing(tx, 'solicitacaoCentroCusto',
      (x) => ({ nCdSolicitacao_nCdEmpresa_nCdFilial_nCdCentroCusto: { nCdSolicitacao: x.nCdSolicitacao, nCdEmpresa: COMPANY, nCdFilial: BRANCH, nCdCentroCusto: CENTER } }),
      rows.requests.map((request) => ({ nCdSolicitacao: request.nCdSolicitacao,
        nCdEmpresa: COMPANY, nCdFilial: BRANCH, nCdCentroCusto: CENTER,
        nCdAprovador: ref.user['aprovador@frota.com.br'],
        cStatusAprovacao: request.cStatus === 'P' ? 'P' : request.cStatus === 'R' ? 'R' : 'A',
        nCdMotivoRecusa: request.cStatus === 'R' ? ID.motive[2] : null })),
    );
    result.corrida = await createMissing(tx, 'corrida',
      (x) => ({ nCdCorrida: x.nCdCorrida }), rows.rides);
    return result;
  }, { timeout: 120000, maxWait: 15000 });
  return created;
}

async function reset(prisma, rows, ref) {
  const externalRequests = await prisma.solicitacao.count({ where: { nCdContrato: { in: ID.contract }, nCdSolicitacao: { notIn: ID.request } } });
  const externalAddressUsers = await prisma.solicitacao.count({ where: { nCdSolicitacao: { notIn: ID.request }, OR: [
    { nCdEnderecoOrigem: { in: ID.address } }, { nCdEnderecoDestino: { in: ID.address } },
    { nCdMotivoSolicitacao: { in: ID.motive } }, { nCdMotivoCancelamento: { in: ID.motive } },
  ] } });
  const externalRides = await prisma.corrida.count({ where: { OR: [
    { nCdSolicitacao: { in: ID.request }, nCdCorrida: { notIn: ID.ride } },
    { nCdMotorista: { in: ID.user }, nCdCorrida: { notIn: ID.ride } },
    { nCdCorrida: { notIn: ID.ride }, OR: rows.vehicles.map(({ nCdFornecedor, nCdVeiculo }) => ({ nCdFornecedor, nCdVeiculo })) },
  ] } });
  if (externalRequests || externalAddressUsers || externalRides) throw new Error('Non-fixture records depend on fixtures; reset refused');
  await prisma.$transaction(async (tx) => {
    for (const model of ['corridaPosicao', 'corridaEspera', 'corridaParadaProgresso', 'corridaRota', 'comandoIdempotente', 'despesaCorrida', 'recusaCorrida', 'regraCorrida']) {
      await tx[model].deleteMany({ where: { nCdCorrida: { in: ID.ride } } });
    }
    await tx.corrida.deleteMany({ where: { nCdCorrida: { in: ID.ride } } });
    for (const model of ['parada', 'solicitacaoPassageiro', 'solicitacaoResposta', 'solicitacaoCentroCusto']) {
      await tx[model].deleteMany({ where: { nCdSolicitacao: { in: ID.request } } });
    }
    await tx.solicitacao.deleteMany({ where: { nCdSolicitacao: { in: ID.request } } });
    await tx.modalidadeContrato.deleteMany({ where: { nCdContrato: { in: ID.contract } } });
    await tx.filialFornecedor.deleteMany({ where: { nCdContrato: { in: ID.contract } } });
    await tx.condicaoRegraRotaFixa.deleteMany({ where: { nCdContrato: { in: ID.contract } } });
    await tx.condicaoRegraOutro.deleteMany({ where: { nCdContrato: { in: ID.contract } } });
    await tx.condicaoRegra.deleteMany({ where: { nCdContrato: { in: ID.contract } } });
    await tx.rotaFixa.deleteMany({ where: { nCdContrato: { in: ID.contract } } });
    await tx.perguntaContrato.deleteMany({ where: { nCdContrato: { in: ID.contract } } });
    await tx.regra.deleteMany({ where: { nCdContrato: { in: ID.contract } } });
    await tx.contrato.deleteMany({ where: { nCdContrato: { in: ID.contract } } });
    await tx.veiculo.deleteMany({ where: { OR: rows.vehicles.map(({ nCdFornecedor, nCdVeiculo }) => ({ nCdFornecedor, nCdVeiculo })) } });
    await tx.pinUsuario.deleteMany({ where: { nCdUsuario: { in: ID.user } } });
    await tx.usuarioPerfil.deleteMany({ where: { nCdUsuario: { in: ID.user } } });
    await tx.usuario.deleteMany({ where: { nCdUsuario: { in: ID.user } } });
    await tx.motivo.deleteMany({ where: { nCdMotivo: { in: ID.motive } } });
    await tx.endereco.deleteMany({ where: { nCdEndereco: { in: ID.address } } });
    // Technical catalogs remain because later non-fixture transactions may use them.
  }, { timeout: 120000, maxWait: 15000 });
  await removePdfs();
  return { removed: 'fixture-owned transactional rows only', catalogsRetained: true };
}

async function main() {
  const { PrismaClient } = require('@prisma/client');
  const { PrismaMssql } = require('@prisma/adapter-mssql');
  const options = parseArgs(process.argv.slice(2));
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');
  const target = databaseTarget(url);
  if (options.mode !== 'dry-run' && (target.host !== options['expect-host'] || target.database !== options['expect-database'])) {
    throw new Error('Database target does not match explicit confirmation');
  }
  const prisma = new PrismaClient({ adapter: new PrismaMssql(url) });
  try {
    const ref = await dependencies(prisma);
    const rows = fixtureRows(ref);
    const before = await examine(prisma, rows, ref);
    if (options.mode === 'dry-run') {
      console.log(JSON.stringify({ mode: 'dry-run', targetConfirmed: true, plan: before }));
      return;
    }
    const result = options.mode === 'apply' ? await apply(prisma, rows, ref) : await reset(prisma, rows, ref);
    const after = await examine(prisma, rows, ref);
    console.log(JSON.stringify({ mode: options.mode, targetConfirmed: true, result, after }));
  } finally { await prisma.$disconnect(); }
}

if (require.main === module || process.argv[1] === '-') {
  main().catch((error) => {
    const detail = error.constructor === Error ? error.message : `${error.constructor.name} ${error.code || ''} ${error.meta?.modelName || ''}`;
    console.error(`Fixture operation failed: ${detail}`);
    process.exitCode = 1;
  });
}

module.exports = { parseArgs, databaseTarget, fixtureRows, pdfBytes, sameFields, ID };
