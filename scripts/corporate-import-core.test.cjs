const test = require('node:test');
const assert = require('node:assert/strict');
const { parseRows } = require('./corporate-import-core.cjs');

const day = new Date('2026-01-01T00:00:00.000Z');
function row(values) { return { getCell: (column) => ({ value: values[column - 1] ?? null }) }; }
function fixture() {
  return {
    Empresa: [row([30, 'EXAMPLE COMPANY', day, null])],
    Filial: [row([30, 704, 'EXAMPLE BRANCH', 'EX', 'R', 'EXAMPLE STREET', null,
      'EXAMPLE DISTRICT', 'EXAMPLE CITY', 'PR', 1234567, '00.000.000/0001-00', day,
      null, -23.123456, -51.123456])],
    'Centro de Custo': [row([30, 704, 4704, 'EXAMPLE COST CENTER', null])],
    Fornecedor: [row([1665323, 1, 0, 'EXAMPLE SUPPLIER', 1, 'APROVADO', day])],
  };
}

test('maps composite keys, missing street number and an Excel CEP with a lost leading zero', () => {
  const parsed = parseRows(fixture(), day);
  assert.equal(parsed.branches[0].address.cNumero, 'S/N');
  assert.equal(parsed.branches[0].address.cCEP, '01234567');
  assert.equal(parsed.centers.length, 1);
  assert.equal(parsed.rejected.centerReference, 0);
  assert.equal(parsed.suppliers[0].cCNPJCPF, null);
});

test('normalizes unusable zero street numbers and coordinates to stored precision', () => {
  const rows = fixture();
  rows.Filial[0] = row([30, 704, 'EXAMPLE BRANCH', 'EX', 'R', 'EXAMPLE STREET', 0,
    'EXAMPLE DISTRICT', 'EXAMPLE CITY', 'PR', 1234567, '00.000.000/0001-00', day,
    null, -23.123456789, -51.123456789]);
  const parsed = parseRows(rows, day);
  assert.equal(parsed.branches[0].address.cNumero, 'S/N');
  assert.equal(parsed.branches[0].address.nLatitude, -23.123457);
  assert.equal(parsed.branches[0].address.nLongitude, -51.123457);
});

test('rejects a cost center whose full company/branch key is absent', () => {
  const rows = fixture();
  rows['Centro de Custo'].push(row([31, 704, 4704, 'ORPHAN', null]));
  const parsed = parseRows(rows, day);
  assert.equal(parsed.centers.length, 1);
  assert.equal(parsed.rejected.centerReference, 1);
});

test('rejects conflicting supplier corporate keys', () => {
  const rows = fixture();
  rows.Fornecedor.push(row([1665323, 1, 0, 'DIFFERENT SUPPLIER', 1, 'APROVADO', day]));
  assert.throws(() => parseRows(rows, day), /duplicate corporate key/);
});

test('rejects duplicate companies', () => {
  const rows = fixture();
  rows.Empresa.push(row([30, 'ANOTHER COMPANY', day, null]));
  assert.throws(() => parseRows(rows, day), /duplicate corporate key/);
});

test('rejects invalid types, overlength strings and dates', () => {
  const invalidType = fixture();
  invalidType.Empresa[0] = row(['not-a-number', 'EXAMPLE COMPANY', day, null]);
  assert.throws(() => parseRows(invalidType, day), /invalid integer/);
  const overlength = fixture();
  overlength.Empresa[0] = row([30, 'X'.repeat(101), day, null]);
  assert.throws(() => parseRows(overlength, day), /exceeds 100/);
  const invalidDate = fixture();
  invalidDate.Empresa[0] = row([30, 'EXAMPLE COMPANY', 'not-a-date', null]);
  assert.throws(() => parseRows(invalidDate, day), /invalid date/);
});

test('requires supplier status code and label to agree', () => {
  const rows = fixture();
  rows.Fornecedor[0] = row([1665323, 1, 0, 'EXAMPLE SUPPLIER', 2, 'APROVADO', day]);
  assert.throws(() => parseRows(rows, day), /status code and label disagree/);
});
