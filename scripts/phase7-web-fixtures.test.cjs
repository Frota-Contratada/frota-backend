const test = require('node:test');
const assert = require('node:assert/strict');
const { ID, parseArgs, databaseTarget, fixtureRows, pdfBytes } = require('./phase7-web-fixtures.cjs');

const refs = {
  user: { 'admin.master@frota.com.br': 1, 'aprovador@frota.com.br': 5,
    'solicitante@frota.com.br': 6, 'motorista@frota.com.br': 8 },
  supplier: { 1665323: 864, 9174938: 6796 },
};

test('mutations require an explicit target', () => {
  assert.throws(() => parseArgs(['--apply']), /expect-host/);
  assert.throws(() => parseArgs(['--reset']), /expect-host/);
  assert.deepEqual(parseArgs([]), { mode: 'dry-run' });
  assert.deepEqual(databaseTarget('sqlserver://127.0.0.1:1433;database=phase7;user=sa;password=hidden'),
    { host: '127.0.0.1', database: 'phase7' });
});

test('synthetic requests, rides and suppliers remain internally consistent', () => {
  const data = fixtureRows(refs, new Date('2026-10-09T12:00:00.000Z'));
  assert.equal(data.requests.length, 31);
  assert.equal(data.rides.length, 24);
  assert.equal(data.contracts.length, 3);
  assert.equal(data.motives.length, 4);
  assert.equal(data.motives[3].cTipoMotivo, '4');
  assert.equal(data.drivers.length, 3);
  assert.equal(data.vehicles.length, 4);
  const requestById = new Map(data.requests.map((row) => [row.nCdSolicitacao, row]));
  const vehicleByKey = new Map(data.vehicles.map((row) => [`${row.nCdFornecedor}:${row.nCdVeiculo}`, row]));
  const driverById = new Map(data.drivers.map((row) => [row.nCdUsuario, row]));
  for (const ride of data.rides) {
    const request = requestById.get(ride.nCdSolicitacao);
    assert.ok(request);
    assert.equal(request.cStatus, 'A');
    assert.equal(request.nCdFornecedor, ride.nCdFornecedor);
    assert.equal(vehicleByKey.get(`${ride.nCdFornecedor}:${ride.nCdVeiculo}`).nCdTpVeiculo,
      request.nCdTpVeiculo);
    if (driverById.has(ride.nCdMotorista)) {
      assert.equal(driverById.get(ride.nCdMotorista).nCdFornecedor, ride.nCdFornecedor);
    }
  }
  assert.ok(data.requests.every((row) => ID.request.includes(row.nCdSolicitacao)));
  assert.ok(data.rides.every((row) => ID.ride.includes(row.nCdCorrida)));
});

test('fixture PDF is a self-contained synthetic PDF', () => {
  const pdf = pdfBytes('PHASE7 WEB CONTRACT 1').toString('ascii');
  assert.match(pdf, /^%PDF-1\.4/);
  assert.match(pdf, /xref\n0 6/);
  assert.match(pdf, /Synthetic document for HML Web validation only/);
  assert.match(pdf, /%%EOF\n$/);
});
