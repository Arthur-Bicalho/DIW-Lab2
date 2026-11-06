import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  podeTransitar, clientePodeModificar, clientePodeCancelar, validarPedido, automovelDisponivel,
} from '../src/pedidos-contratos/regras/pedido.js';

test('podeTransitar aceita o fluxo previsto no ADR 0001', () => {
  assert.equal(podeTransitar('PENDENTE', 'EM_ANALISE'), true);
  assert.equal(podeTransitar('EM_ANALISE', 'APROVADO'), true);
  assert.equal(podeTransitar('EM_ANALISE', 'REPROVADO'), true);
  assert.equal(podeTransitar('APROVADO', 'CONTRATADO'), true);
  assert.equal(podeTransitar('APROVADO', 'CANCELADO'), true);
});

test('podeTransitar recusa saltos e saídas de estados finais', () => {
  assert.equal(podeTransitar('PENDENTE', 'APROVADO'), false);
  assert.equal(podeTransitar('REPROVADO', 'APROVADO'), false);
  assert.equal(podeTransitar('CONTRATADO', 'CANCELADO'), false);
  assert.equal(podeTransitar('CANCELADO', 'PENDENTE'), false);
});

test('Cliente só modifica Pedido PENDENTE', () => {
  assert.equal(clientePodeModificar({ status: 'PENDENTE' }), true);
  assert.equal(clientePodeModificar({ status: 'EM_ANALISE' }), false);
});

test('Cliente cancela até APROVADO e nunca depois de CONTRATADO', () => {
  for (const status of ['PENDENTE', 'EM_ANALISE', 'APROVADO']) {
    assert.equal(clientePodeCancelar({ status }), true, status);
  }
  for (const status of ['REPROVADO', 'CONTRATADO', 'CANCELADO']) {
    assert.equal(clientePodeCancelar({ status }), false, status);
  }
});

const hoje = '2026-11-06';

test('validarPedido aceita Automóvel e período válidos', () => {
  assert.deepEqual(validarPedido({ automovelId: '1', dataInicio: '2026-12-01', dataFim: '2026-12-05' }, hoje), {});
});

test('validarPedido exige automóvel e datas', () => {
  const erros = validarPedido({}, hoje);
  assert.ok(erros.automovelId && erros.dataInicio && erros.dataFim);
});

test('validarPedido recusa início no passado e fim não posterior ao início', () => {
  assert.ok(validarPedido({ automovelId: '1', dataInicio: '2026-11-05', dataFim: '2026-12-05' }, hoje).dataInicio);
  assert.ok(validarPedido({ automovelId: '1', dataInicio: '2026-12-05', dataFim: '2026-12-05' }, hoje).dataFim);
  assert.equal(validarPedido({ automovelId: '1', dataInicio: hoje, dataFim: '2026-11-07' }, hoje).dataInicio, undefined);
});

test('automovelDisponivel ignora Pedidos encerrados e o próprio Pedido', () => {
  const pedidos = [
    { id: '1', automovelId: '1', status: 'CANCELADO' },
    { id: '2', automovelId: '1', status: 'REPROVADO' },
    { id: '3', automovelId: '2', status: 'PENDENTE' },
  ];
  assert.equal(automovelDisponivel('1', pedidos), true);
  assert.equal(automovelDisponivel('2', pedidos), false);
  assert.equal(automovelDisponivel('2', pedidos, '3'), true);
});
