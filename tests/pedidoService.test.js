import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { instalarBancoFalso } from './apoio/bancoFalso.js';
import { pedidoService } from '../src/pedidos-contratos/services/pedidoService.js';
import { ErroValidacao } from '../src/pedidos-contratos/regras/erros.js';

const hoje = '2026-11-06';
const dados = { automovelId: '1', dataInicio: '2026-12-01', dataFim: '2026-12-10' };
let banco;

beforeEach(() => {
  banco = instalarBancoFalso(['pedidos', 'automoveis']);
  banco.automoveis.push({ id: '1' }, { id: '2' });
});

test('criar grava Pedido PENDENTE do Cliente, sem Agente nem Parecer', async () => {
  const pedido = await pedidoService.criar('7', dados, hoje);
  assert.equal(pedido.status, 'PENDENTE');
  assert.equal(pedido.clienteId, '7');
  assert.equal(pedido.agenteId, null);
  assert.equal(pedido.parecer, null);
});

test('criar recusa dados inválidos', async () => {
  await assert.rejects(pedidoService.criar('7', { ...dados, dataFim: '2026-11-30' }, hoje), ErroValidacao);
});

test('criar recusa Automóvel já ocupado por outro Pedido', async () => {
  await pedidoService.criar('7', dados, hoje);
  await assert.rejects(
    pedidoService.criar('8', dados, hoje),
    (erro) => erro instanceof ErroValidacao && Boolean(erro.erros.automovelId),
  );
});

test('modificar altera Pedido PENDENTE do próprio Cliente', async () => {
  const { id } = await pedidoService.criar('7', dados, hoje);
  const alterado = await pedidoService.modificarDoCliente(id, '7', { ...dados, automovelId: '2' }, hoje);
  assert.equal(alterado.automovelId, '2');
});

test('modificar recusa Pedido de outro Cliente ou fora de PENDENTE', async () => {
  const { id } = await pedidoService.criar('7', dados, hoje);
  await assert.rejects(pedidoService.modificarDoCliente(id, '8', dados, hoje), ErroValidacao);
  banco.pedidos[0].status = 'EM_ANALISE';
  await assert.rejects(pedidoService.modificarDoCliente(id, '7', dados, hoje), ErroValidacao);
});

test('cancelar muda o status para CANCELADO e libera o Automóvel', async () => {
  const { id } = await pedidoService.criar('7', dados, hoje);
  await pedidoService.cancelarDoCliente(id, '7');
  assert.equal(banco.pedidos[0].status, 'CANCELADO');
  await pedidoService.criar('8', dados, hoje);
});

test('cancelar recusa Pedido CONTRATADO e Pedido de outro Cliente', async () => {
  const { id } = await pedidoService.criar('7', dados, hoje);
  await assert.rejects(pedidoService.cancelarDoCliente(id, '8'), ErroValidacao);
  banco.pedidos[0].status = 'CONTRATADO';
  await assert.rejects(pedidoService.cancelarDoCliente(id, '7'), ErroValidacao);
});

test('listarDoCliente devolve só os Pedidos do Cliente', async () => {
  await pedidoService.criar('7', dados, hoje);
  await pedidoService.criar('8', { ...dados, automovelId: '2' }, hoje);
  assert.equal((await pedidoService.listarDoCliente('7')).length, 1);
});
