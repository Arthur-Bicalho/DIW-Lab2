import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatarCpf } from '../src/pedidos-contratos/regras/formatacao.js';

test('formatarCpf aplica a máscara', () => {
  assert.equal(formatarCpf('52998224725'), '529.982.247-25');
});
