import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatarCpf, formatarData, dataDeHoje } from '../src/pedidos-contratos/regras/formatacao.js';

test('formatarCpf aplica a máscara', () => {
  assert.equal(formatarCpf('52998224725'), '529.982.247-25');
});

test('formatarData converte ISO para dd/mm/aaaa', () => {
  assert.equal(formatarData('2026-12-10'), '10/12/2026');
});

test('dataDeHoje devolve a data local no formato ISO', () => {
  assert.match(dataDeHoje(), /^\d{4}-\d{2}-\d{2}$/);
});
