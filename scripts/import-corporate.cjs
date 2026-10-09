#!/usr/bin/env node
// Corporate data stays in the supplied workbook or in protected process memory.
const { createHash } = require('node:crypto');
const { createReadStream } = require('node:fs');
const { PrismaClient } = require('@prisma/client');
const { PrismaMssql } = require('@prisma/adapter-mssql');
const { readSource } = require('./corporate-import-core.cjs');

const BATCH = 100;

function args(argv) {
  const out = { mode: 'dry-run' };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--apply') out.mode = 'apply';
    else if (argv[i] === '--dry-run') out.mode = 'dry-run';
    else if (['--excel', '--expect-host', '--expect-database', '--source-sha256'].includes(argv[i])) out[argv[i].slice(2)] = argv[++i];
    else throw new Error('Unknown import option');
  }
  if (!out.excel) throw new Error('--excel is required');
  if (out.mode === 'apply' && (!out['expect-host'] || !out['expect-database'] || !out['source-sha256'])) {
    throw new Error('Apply requires target host, database and exact source SHA256');
  }
  return out;
}

async function sha256(path) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex').toUpperCase();
}

function key(...parts) { return parts.map(String).join(':'); }
function asNumber(value) { return Number(value?.toString() ?? 0); }
function comparable(value) {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object' && typeof value.toString === 'function') return value.toString();
  return String(value);
}
function equalFields(old, next) {
  return Object.entries(next).every(([name, value]) => {
    if (typeof value === 'number') return Number(old[name]) === value;
    return comparable(old[name]) === comparable(value);
  });
}
function split(items, size = BATCH) {
  const batches = [];
  for (let i = 0; i < items.length; i += size) batches.push(items.slice(i, i + size));
  return batches;
}

function classify(rows, existing, keyOf, build) {
  const map = new Map(existing.map((x) => [keyOf(x), x]));
  const create = [], update = [];
  let ignored = 0;
  for (const row of rows) {
    const previous = map.get(keyOf(row));
    const data = build(row, previous);
    if (!previous) create.push(data);
    else if (equalFields(previous, data)) ignored++;
    else update.push({ key: keyOf(row), data });
  }
  return { create, update, ignored, existing: existing.length };
}

async function buildPlan(prisma, source, now) {
  const [companies, branches, centers, suppliers, maxAddress, maxSupplier] = await Promise.all([
    prisma.empresa.findMany(),
    prisma.filial.findMany({ include: { Endereco: true } }),
    prisma.centroCusto.findMany(),
    prisma.fornecedor.findMany(),
    prisma.endereco.aggregate({ _max: { nCdEndereco: true } }),
    prisma.fornecedor.aggregate({ _max: { nCdFornecedor: true } }),
  ]);
  const company = classify(source.companies, companies, (x) => key(x.nCdEmpresa), (x) => x);
  const addressByBranch = new Map(branches.map((x) => [key(x.nCdEmpresa, x.nCdFilial), x.Endereco]));
  let nextAddress = asNumber(maxAddress._max.nCdEndereco) + 1;
  const addresses = { create: [], update: [], ignored: 0, existing: addressByBranch.size };
  const newAddressIds = new Map();
  for (const item of [...source.branches].sort((a, b) => a.nCdEmpresa-b.nCdEmpresa || a.nCdFilial-b.nCdFilial)) {
    const id = key(item.nCdEmpresa, item.nCdFilial);
    const previous = addressByBranch.get(id);
    if (previous) {
      if (equalFields(previous, item.address)) addresses.ignored++;
      else addresses.update.push({ key: asNumber(previous.nCdEndereco), data: item.address });
    } else {
      if (nextAddress > 9_999_999_999) throw new Error('Endereco UID space exhausted');
      newAddressIds.set(id, nextAddress);
      addresses.create.push({ nCdEndereco: nextAddress++, ...item.address });
    }
  }
  const branch = classify(source.branches, branches,
    (x) => key(x.nCdEmpresa, x.nCdFilial),
    (x, previous) => ({ nCdEmpresa: x.nCdEmpresa, nCdFilial: x.nCdFilial,
      cMnemonico: x.cMnemonico, cNmFilial: x.cNmFilial, cCNPJ: x.cCNPJ,
      nCdEndereco: previous ? asNumber(previous.nCdEndereco) : newAddressIds.get(key(x.nCdEmpresa, x.nCdFilial)),
      dAtivacao: x.dAtivacao, dDesativacao: x.dDesativacao }));
  const center = classify(source.centers, centers,
    (x) => key(x.nCdEmpresa, x.nCdFilial, x.nCdCentroCusto),
    (x, previous) => ({ ...x, dAtivacao: previous?.dAtivacao ?? now }));
  let nextSupplier = asNumber(maxSupplier._max.nCdFornecedor) + 1;
  const supplier = classify([...source.suppliers].sort((a,b) =>
    a.nCdBaseFornecedor-b.nCdBaseFornecedor || a.nCdEstabFornecedor-b.nCdEstabFornecedor),
    suppliers,
    (x) => key(x.nCdBaseFornecedor, x.nCdEstabFornecedor),
    (x, previous) => {
      const data = { ...x,
        nCdFornecedor: previous ? asNumber(previous.nCdFornecedor) : nextSupplier++,
        dAtivacao: previous?.dAtivacao ?? x.dAtivacao,
        dDesativacao: x.nCdSituacaoCadastro === 1 ? null : previous?.dDesativacao ?? now };
      if (data.nCdFornecedor > 9_999_999_999) throw new Error('Fornecedor UID space exhausted');
      return data;
    });
  return { company, addresses, branch, center, supplier };
}

function summary(plan, source) {
  const out = { source: source.sourceCounts, rejected: source.rejected, entities: {} };
  for (const [name, p] of Object.entries(plan)) out.entities[name] = {
    insert: p.create.length, update: p.update.length, ignored: p.ignored, existing: p.existing,
  };
  return out;
}

async function writeBatch(prisma, model, items) {
  for (const batch of split(items)) {
    await prisma.$transaction(async (tx) => {
      await tx[model].createMany({ data: batch });
    }, { isolationLevel: 'Serializable', timeout: 120_000 });
  }
}

async function applyPlan(prisma, plan) {
  if (plan.addresses.create.length !== plan.branch.create.length) throw new Error('Endereco/Filial insert plan mismatch');
  await writeBatch(prisma, 'empresa', plan.company.create);
  for (const entry of plan.company.update) await prisma.empresa.update({ where: { nCdEmpresa: Number(entry.key) }, data: entry.data });
  const newAddress = new Map(plan.addresses.create.map((x) => [x.nCdEndereco, x]));
  for (const batch of split(plan.branch.create, 50)) {
    await prisma.$transaction(async (tx) => {
      await tx.endereco.createMany({ data: batch.map((x) => newAddress.get(x.nCdEndereco)) });
      await tx.filial.createMany({ data: batch });
    }, { isolationLevel: 'Serializable', timeout: 120_000 });
  }
  for (const entry of plan.addresses.update) await prisma.endereco.update({ where: { nCdEndereco: entry.key }, data: entry.data });
  for (const entry of plan.branch.update) {
    const [nCdEmpresa, nCdFilial] = entry.key.split(':').map(Number);
    await prisma.filial.update({ where: { nCdEmpresa_nCdFilial: { nCdEmpresa, nCdFilial } }, data: entry.data });
  }
  await writeBatch(prisma, 'centroCusto', plan.center.create);
  for (const entry of plan.center.update) {
    const [nCdEmpresa, nCdFilial, nCdCentroCusto] = entry.key.split(':').map(Number);
    await prisma.centroCusto.update({ where: { nCdEmpresa_nCdFilial_nCdCentroCusto: { nCdEmpresa, nCdFilial, nCdCentroCusto } }, data: entry.data });
  }
  await writeBatch(prisma, 'fornecedor', plan.supplier.create);
  for (const entry of plan.supplier.update) {
    const { nCdFornecedor, ...data } = entry.data;
    await prisma.fornecedor.update({ where: { nCdFornecedor }, data });
  }
}

async function main() {
  const options = args(process.argv.slice(2));
  const hash = await sha256(options.excel);
  if (options['source-sha256'] && options['source-sha256'].toUpperCase() !== hash) throw new Error('Source SHA256 mismatch');
  const now = new Date();
  const source = await readSource(options.excel, now);
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is absent');
  const host = /^sqlserver:\/\/([^:;/]+)/i.exec(url)?.[1];
  if (!host) throw new Error('Database host cannot be identified');
  const prisma = new PrismaClient({ adapter: new PrismaMssql(url) });
  try {
    const identity = await prisma.$queryRawUnsafe('SELECT CAST(DB_NAME() AS varchar(128)) AS databaseName');
    const database = identity[0].databaseName;
    if (options['expect-host'] && options['expect-host'] !== host) throw new Error('Database host mismatch');
    if (options['expect-database'] && options['expect-database'] !== database) throw new Error('Database name mismatch');
    const plan = await buildPlan(prisma, source, now);
    console.log(JSON.stringify({ mode: options.mode, sourceSha256: hash, databaseHost: host, database, ...summary(plan, source) }));
    if (options.mode === 'apply') {
      await applyPlan(prisma, plan);
      console.log(JSON.stringify({ result: 'applied', counts: { company: await prisma.empresa.count(), branch: await prisma.filial.count(),
        address: await prisma.endereco.count(), center: await prisma.centroCusto.count(), supplier: await prisma.fornecedor.count() } }));
    }
  } finally { await prisma.$disconnect(); }
}

if (require.main === module) main().catch((error) => {
  console.error('CORPORATE_IMPORT_FAILED', error.code || error.constructor.name);
  process.exitCode = 1;
});

module.exports = { args, buildPlan, summary, applyPlan, equalFields };
