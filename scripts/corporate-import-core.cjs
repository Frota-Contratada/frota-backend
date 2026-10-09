const ExcelJS = require('exceljs');

const SHEETS = ['Empresa', 'Filial', 'Centro de Custo', 'Fornecedor'];
const MAX_ID = 9_999_999_999;

function fail(message) {
  throw new Error(message);
}

function cell(row, column) {
  const value = row.getCell(column).value;
  if (value && typeof value === 'object' && 'result' in value) return value.result;
  return value;
}

function string(value, max, label, { optional = false } = {}) {
  const result = value == null ? '' : String(value).trim();
  if (!result && !optional) fail(`${label}: required value is absent`);
  if (result.length > max) fail(`${label}: exceeds ${max} characters`);
  return result || null;
}

function integer(value, label) {
  const text = value == null ? '' : String(value).trim();
  if (!/^\d+(?:\.0+)?$/.test(text)) fail(`${label}: invalid integer`);
  const number = Number(text);
  if (!Number.isSafeInteger(number) || number < 0 || number > MAX_ID) fail(`${label}: integer outside Decimal(10,0)`);
  return number;
}

function date(value, label, optional = false) {
  if (value == null || value === '') {
    if (optional) return null;
    fail(`${label}: required date is absent`);
  }
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) fail(`${label}: invalid date`);
  return value;
}

function coordinate(value, low, high, label) {
  const number = Number(String(value).replace(',', '.'));
  if (!Number.isFinite(number) || number < low || number > high) fail(`${label}: invalid coordinate`);
  // Endereco uses Decimal(9,6); normalize before comparing on a later run.
  return Number(number.toFixed(6));
}

function digits(value, length, label, { pad = false } = {}) {
  const result = String(value ?? '').replace(/\D/g, '');
  if (pad && result.length === length - 1) return result.padStart(length, '0');
  if (result.length !== length) fail(`${label}: expected ${length} digits`);
  return result;
}

function unique(rows, key, label) {
  const seen = new Map();
  for (const row of rows) {
    const id = key(row);
    if (seen.has(id)) fail(`${label}: duplicate corporate key ${id}`);
    seen.set(id, row);
  }
}

function parseRows(rows, now = new Date()) {
  const companies = rows.Empresa.map((row) => ({
    nCdEmpresa: integer(cell(row, 1), 'Empresa.A'),
    cNmEmpresa: string(cell(row, 2), 100, 'Empresa.B'),
    dAtivacao: date(cell(row, 3), 'Empresa.C'),
    dDesativacao: date(cell(row, 4), 'Empresa.D', true),
  }));
  unique(companies, (x) => String(x.nCdEmpresa), 'Empresa');
  const companyKeys = new Set(companies.map((x) => x.nCdEmpresa));

  const branches = rows.Filial.map((row) => {
    const nCdEmpresa = integer(cell(row, 1), 'Filial.A');
    const nCdFilial = integer(cell(row, 2), 'Filial.B');
    if (!companyKeys.has(nCdEmpresa)) fail('Filial: company reference is absent from source');
    const rawNumber = cell(row, 7);
    const cNumero = rawNumber == null || String(rawNumber).trim() === '' || String(rawNumber).trim() === '0'
      ? 'S/N' : string(rawNumber, 20, 'Filial.G');
    return {
      nCdEmpresa, nCdFilial,
      cNmFilial: string(cell(row, 3), 100, 'Filial.C'),
      cMnemonico: string(cell(row, 4), 50, 'Filial.D', { optional: true }),
      cCNPJ: digits(cell(row, 12), 14, 'Filial.L'),
      dAtivacao: date(cell(row, 13), 'Filial.M'),
      dDesativacao: date(cell(row, 14), 'Filial.N', true),
      address: {
        cTpLogradouro: string(cell(row, 5), 10, 'Filial.E', { optional: true }),
        cEndereco: string(cell(row, 6), 200, 'Filial.F'),
        cNumero,
        cComplemento: null,
        cBairro: string(cell(row, 8), 100, 'Filial.H'),
        cCidade: string(cell(row, 9), 100, 'Filial.I'),
        cUf: string(cell(row, 10), 2, 'Filial.J'),
        cCEP: digits(cell(row, 11), 8, 'Filial.K', { pad: true }),
        nLatitude: coordinate(cell(row, 15), -90, 90, 'Filial.O'),
        nLongitude: coordinate(cell(row, 16), -180, 180, 'Filial.P'),
      },
    };
  });
  unique(branches, (x) => `${x.nCdEmpresa}:${x.nCdFilial}`, 'Filial');
  unique(branches, (x) => x.cCNPJ, 'Filial.cCNPJ');
  const branchKeys = new Set(branches.map((x) => `${x.nCdEmpresa}:${x.nCdFilial}`));

  const centers = [];
  const rejectedCenters = [];
  for (const row of rows['Centro de Custo']) {
    const item = {
      nCdEmpresa: integer(cell(row, 1), 'CentroCusto.A'),
      nCdFilial: integer(cell(row, 2), 'CentroCusto.B'),
      nCdCentroCusto: integer(cell(row, 3), 'CentroCusto.C'),
      cNmCentroCusto: string(cell(row, 4), 100, 'CentroCusto.D'),
      dDesativacao: date(cell(row, 5), 'CentroCusto.E', true),
    };
    if (branchKeys.has(`${item.nCdEmpresa}:${item.nCdFilial}`)) centers.push(item);
    else rejectedCenters.push(item);
  }
  unique([...centers, ...rejectedCenters], (x) => `${x.nCdEmpresa}:${x.nCdFilial}:${x.nCdCentroCusto}`, 'CentroCusto');

  const statusByCode = new Map([[1, 'APROVADO'], [2, 'INATIVO'], [3, 'LISTA AMARELA'], [4, 'BLOQUEADO']]);
  const suppliers = rows.Fornecedor.map((row) => {
    const nCdSituacaoCadastro = integer(cell(row, 5), 'Fornecedor.E');
    const cSituacaoCadastro = string(cell(row, 6), 50, 'Fornecedor.F');
    if (statusByCode.get(nCdSituacaoCadastro) !== cSituacaoCadastro) fail('Fornecedor: status code and label disagree');
    const dCadastro = date(cell(row, 7), 'Fornecedor.G');
    return {
      nCdBaseFornecedor: integer(cell(row, 1), 'Fornecedor.A'),
      nCdEstabFornecedor: integer(cell(row, 2), 'Fornecedor.B'),
      nDigitoFornecedor: integer(cell(row, 3), 'Fornecedor.C'),
      cNmFornecedor: string(cell(row, 4), 150, 'Fornecedor.D'),
      nCdSituacaoCadastro, cSituacaoCadastro, dCadastro,
      cCNPJCPF: null,
      dAtivacao: dCadastro,
      dDesativacao: nCdSituacaoCadastro === 1 ? null : now,
    };
  });
  unique(suppliers, (x) => `${x.nCdBaseFornecedor}:${x.nCdEstabFornecedor}`, 'Fornecedor');

  return {
    companies, branches, centers, suppliers,
    rejected: { centerReference: rejectedCenters.length,
      missingBranchCombinations: new Set(rejectedCenters.map((x) => `${x.nCdEmpresa}:${x.nCdFilial}`)).size },
    sourceCounts: { company: rows.Empresa.length, branch: rows.Filial.length,
      center: rows['Centro de Custo'].length, supplier: rows.Fornecedor.length },
  };
}

async function readSource(path, now) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(path);
  const rows = {};
  for (const name of SHEETS) {
    const sheet = workbook.getWorksheet(name);
    if (!sheet) fail(`Required worksheet is absent: ${name}`);
    rows[name] = [];
    sheet.eachRow((row, number) => { if (number > 1) rows[name].push(row); });
  }
  return parseRows(rows, now);
}

module.exports = { readSource, parseRows, integer, date, digits, unique };
