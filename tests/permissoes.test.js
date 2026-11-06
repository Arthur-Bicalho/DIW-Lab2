import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ehAgente, ehCliente, podeAcessarPagina, paginaInicial, podeGerenciarCliente } from '../src/pedidos-contratos/regras/permissoes.js';

test('ehAgente é verdadeiro para EMPRESA e BANCO, falso para CLIENTE', () => {
  assert.equal(ehAgente('EMPRESA'), true);
  assert.equal(ehAgente('BANCO'), true);
  assert.equal(ehAgente('CLIENTE'), false);
});

test('podeAcessarPagina separa as páginas por perfil', () => {
  assert.equal(podeAcessarPagina('CLIENTE', 'pedidos'), true);
  assert.equal(podeAcessarPagina('CLIENTE', 'avaliacao'), false);
  assert.equal(podeAcessarPagina('BANCO', 'avaliacao'), true);
  assert.equal(podeAcessarPagina('EMPRESA', 'pedidos'), false);
  assert.equal(podeAcessarPagina('EMPRESA', 'clientes'), true);
  assert.equal(podeAcessarPagina(undefined, 'clientes'), false);
});

test('paginaInicial leva cada perfil à sua página', () => {
  assert.equal(paginaInicial('CLIENTE'), 'meus-pedidos.html');
  assert.equal(paginaInicial('BANCO'), 'avaliacao.html');
});

test('podeGerenciarCliente só vale para o próprio cliente', () => {
  assert.equal(podeGerenciarCliente({ id: '1', perfil: 'CLIENTE' }, '1'), true);
  assert.equal(podeGerenciarCliente({ id: '1', perfil: 'CLIENTE' }, '2'), false);
  assert.equal(podeGerenciarCliente({ id: '4', perfil: 'EMPRESA' }, '1'), false);
});

test('ehCliente é verdadeiro só para CLIENTE', () => {
  assert.equal(ehCliente('CLIENTE'), true);
  assert.equal(ehCliente('BANCO'), false);
});
