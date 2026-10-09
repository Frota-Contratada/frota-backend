#!/usr/bin/env node
// Reads the test password only from stdin. Never prints or persists it.
const { createRequire } = require('node:module');
const { createInterface } = require('node:readline');
const { existsSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
const appRequire = createRequire(existsSync('/app/package.json') ? '/app/package.json' : join(__dirname, '..', 'package.json'));

const ACCOUNTS = [
  ['admin.master@frota.com.br', 'Administrador Master', 'admin-master', 'global'],
  ['admin.filial@frota.com.br', 'Administrador de Filial', 'admin-filial', 'branch'],
  ['admin.fornecedor@frota.com.br', 'Administrador de Fornecedor', 'admin-fornecedor', 'supplier'],
  ['gestor@frota.com.br', 'Gestor', 'aprovador', 'costCenter'],
  ['aprovador@frota.com.br', 'Aprovador', 'aprovador', 'costCenter'],
  ['solicitante@frota.com.br', 'Solicitante', 'solicitante', 'costCenter'],
  ['passageiro@frota.com.br', 'Passageiro', 'solicitante', 'costCenter'],
  ['motorista@frota.com.br', 'Motorista', 'motorista', 'supplier'],
];

function parseArgs(argv) {
  if (argv[0] !== '--dry-run' && argv[0] !== '--apply') throw new Error('Use --dry-run or --apply');
  const options = { apply: argv[0] === '--apply' };
  for (let i = 1; i < argv.length; i += 2) {
    if (!['--expect-host', '--expect-database', '--scope-file'].includes(argv[i]) || !argv[i + 1]) {
      throw new Error('Invalid account preparation option');
    }
    options[argv[i].slice(2)] = argv[i + 1];
  }
  if (!options['scope-file']) throw new Error('A local scope file is required');
  if (options.apply && (!options['expect-host'] || !options['expect-database'])) {
    throw new Error('Apply requires exact host and database');
  }
  return options;
}

function readScope(path) {
  const scope = JSON.parse(readFileSync(path, 'utf8'));
  for (const field of ['company', 'branch', 'costCenter', 'supplierBase', 'supplierEstablishment']) {
    if (!Number.isSafeInteger(scope[field]) || scope[field] < 0 || scope[field] > 9_999_999_999) {
      throw new Error('Invalid local homologation scope');
    }
  }
  return scope;
}

async function readPassword() {
  const reader = createInterface({ input: process.stdin, terminal: false });
  for await (const line of reader) {
    reader.close();
    if (Buffer.byteLength(line, 'utf8') > 4096) throw new Error('Password input is too long');
    if (!line) throw new Error('Password input is empty');
    return line;
  }
  throw new Error('Password input is empty');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const scope = readScope(options['scope-file']);
  const { PrismaClient } = appRequire('@prisma/client');
  const { PrismaMssql } = appRequire('@prisma/adapter-mssql');
  const argon2 = appRequire('argon2');
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is absent');
  const host = /^sqlserver:\/\/([^:;/]+)/i.exec(url)?.[1];
  if (!host || (options.apply && host !== options['expect-host'])) throw new Error('Database host mismatch');
  const prisma = new PrismaClient({ adapter: new PrismaMssql(url) });
  try {
    const db = (await prisma.$queryRawUnsafe('SELECT CAST(DB_NAME() AS varchar(128)) AS name'))[0].name;
    if (options.apply && db !== options['expect-database']) throw new Error('Database name mismatch');
    const [company, branch, center, supplier, users, maximum] = await Promise.all([
      prisma.empresa.findUnique({ where: { nCdEmpresa: scope.company } }),
      prisma.filial.findUnique({ where: { nCdEmpresa_nCdFilial: { nCdEmpresa: scope.company, nCdFilial: scope.branch } } }),
      prisma.centroCusto.findUnique({ where: { nCdEmpresa_nCdFilial_nCdCentroCusto: { nCdEmpresa: scope.company, nCdFilial: scope.branch, nCdCentroCusto: scope.costCenter } } }),
      prisma.fornecedor.findFirst({ where: { nCdBaseFornecedor: scope.supplierBase, nCdEstabFornecedor: scope.supplierEstablishment } }),
      prisma.usuario.findMany({ where: { cEmail: { in: ACCOUNTS.map((x) => x[0]) } }, include: { UsuarioPerfil: true } }),
      prisma.usuario.aggregate({ _max: { nCdUsuario: true } }),
    ]);
    if (!company || !branch || !center || !supplier) throw new Error('Selected homologation scope is absent');
    const existing = new Map(users.map((x) => [x.cEmail, x]));
    console.log(JSON.stringify({ mode: options.apply ? 'apply' : 'dry-run', databaseHost: host, database: db,
      totalOfficialAccounts: ACCOUNTS.length, toCreate: ACCOUNTS.filter((x) => !existing.has(x[0])).length,
      alreadyExisting: users.length, supplierInternalId: supplier.nCdFornecedor.toString() }));
    if (!options.apply) return;
    const previousMaster = existing.get('admin.master@frota.com.br');
    if (users.length !== 1 || !previousMaster || previousMaster.UsuarioPerfil.length !== 1 ||
        previousMaster.UsuarioPerfil[0].cTipoPerfil !== 'admin-master' || previousMaster.UsuarioPerfil[0].dFimVigencia ||
        previousMaster.nCdEmpresa || previousMaster.nCdFilial || previousMaster.nCdCentroCusto || previousMaster.nCdFornecedor) {
      throw new Error('Unexpected official account state; refusing to overwrite credentials');
    }
    let nextId = Number(maximum._max.nCdUsuario?.toString() ?? 0) + 1;
    if (nextId + ACCOUNTS.length - users.length - 1 > 9_999_999_999) throw new Error('Usuario ID space exhausted');
    const password = await readPassword();
    const now = new Date();
    const prepared = [];
    for (const [email, name, role, accountScope] of ACCOUNTS) {
      const cHashSenha = await argon2.hash(password);
      if (email === 'admin.master@frota.com.br') {
        prepared.push({ existingMaster: true, cHashSenha });
        continue;
      }
      const organizational = accountScope === 'branch' || accountScope === 'costCenter';
      prepared.push({
        nCdUsuario: nextId++, cEmail: email, cNmUsuario: name, cDisponivel: 'S', cHashSenha,
        nCdEmpresa: organizational ? scope.company : null,
        nCdFilial: organizational ? scope.branch : null,
        nCdCentroCusto: accountScope === 'costCenter' ? scope.costCenter : null,
        nCdFornecedor: accountScope === 'supplier' ? supplier.nCdFornecedor : null,
        role, dInicioVigencia: now,
      });
    }
    await prisma.$transaction(async (tx) => {
      for (const entry of prepared) {
        if (entry.existingMaster) {
          await tx.usuario.update({ where: { nCdUsuario: previousMaster.nCdUsuario }, data: { cHashSenha: entry.cHashSenha } });
          continue;
        }
        const { role, dInicioVigencia, ...user } = entry;
        await tx.usuario.create({ data: { ...user, UsuarioPerfil: { create: { cTipoPerfil: role, dInicioVigencia } } } });
      }
    }, { isolationLevel: 'Serializable', timeout: 120_000 });
    console.log(JSON.stringify({ result: 'configured', created: prepared.length - 1, existingMasterPasswordHashUpdated: true,
      profiles: Object.fromEntries(ACCOUNTS.map(([email,,role]) => [email,role])) }));
  } finally { await prisma.$disconnect(); }
}

if (require.main === module) main().catch((e) => {
  console.error('HML_USERS_FAILED', e.code || e.constructor.name);
  process.exitCode = 1;
});

module.exports = { ACCOUNTS, parseArgs };
