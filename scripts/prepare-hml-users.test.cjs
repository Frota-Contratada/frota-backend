const test = require('node:test');
const assert = require('node:assert/strict');
const { ACCOUNTS, parseArgs } = require('./prepare-hml-users.cjs');

test('uses only the approved technical roles for the eight fictional accounts', () => {
  assert.equal(ACCOUNTS.length, 8);
  assert.equal(new Set(ACCOUNTS.map((x) => x[0])).size, 8);
  const roles = Object.fromEntries(ACCOUNTS.map(([email,,role]) => [email, role]));
  assert.equal(roles['gestor@frota.com.br'], 'aprovador');
  assert.equal(roles['passageiro@frota.com.br'], 'solicitante');
  assert.equal(roles['admin.master@frota.com.br'], 'admin-master');
  assert.equal(roles['motorista@frota.com.br'], 'motorista');
  assert.ok(!Object.values(roles).includes('gestor'));
  assert.ok(!Object.values(roles).includes('passageiro'));
});

test('requires an explicit confirmed target for writes', () => {
  assert.throws(() => parseArgs(['--apply']), /scope file/);
  assert.throws(() => parseArgs(['--apply', '--scope-file', 'local.json']), /requires exact host/);
  assert.deepEqual(parseArgs(['--dry-run', '--scope-file', 'local.json']), {
    apply: false, 'scope-file': 'local.json',
  });
});
