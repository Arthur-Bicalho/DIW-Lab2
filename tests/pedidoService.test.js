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

const agente = { id: '5', perfil: 'BANCO' };

test('iniciarAnalise leva o Pedido a EM_ANALISE e registra o Agente', async () => {
  const { id } = await pedidoService.criar('7', dados, hoje);
  const pedido = await pedidoService.iniciarAnalise(id, agente.id);
  assert.equal(pedido.status, 'EM_ANALISE');
  assert.equal(pedido.agenteId, '5');
});

test('iniciarAnalise recusa Pedido que não está PENDENTE', async () => {
  const { id } = await pedidoService.criar('7', dados, hoje);
  await pedidoService.iniciarAnalise(id, '5');
  await assert.rejects(pedidoService.iniciarAnalise(id, '6'), ErroValidacao);
});

test('avaliar com Parecer positivo aprova e grava o Parecer', async () => {
  const { id } = await pedidoService.criar('7', dados, hoje);
  await pedidoService.iniciarAnalise(id, '5');
  const pedido = await pedidoService.avaliar(id, '5', { positivo: true, justificativa: 'Renda compatível.' }, hoje);
  assert.equal(pedido.status, 'APROVADO');
  assert.deepEqual(pedido.parecer, { positivo: true, justificativa: 'Renda compatível.', data: hoje });
});

test('avaliar com Parecer negativo reprova', async () => {
  const { id } = await pedidoService.criar('7', dados, hoje);
  await pedidoService.iniciarAnalise(id, '5');
  const pedido = await pedidoService.avaliar(id, '5', { positivo: false, justificativa: 'Renda insuficiente.' }, hoje);
  assert.equal(pedido.status, 'REPROVADO');
});

test('avaliar recusa outro Agente e Parecer sem justificativa', async () => {
  const { id } = await pedidoService.criar('7', dados, hoje);
  await pedidoService.iniciarAnalise(id, '5');
  await assert.rejects(pedidoService.avaliar(id, '6', { positivo: true, justificativa: 'ok' }, hoje), ErroValidacao);
  await assert.rejects(pedidoService.avaliar(id, '5', { positivo: true, justificativa: '' }, hoje), ErroValidacao);
});

test('modificarComoAgente altera Pedido EM_ANALISE e recusa APROVADO', async () => {
  const { id } = await pedidoService.criar('7', dados, hoje);
  await pedidoService.iniciarAnalise(id, '5');
  const alterado = await pedidoService.modificarComoAgente(id, { ...dados, automovelId: '2' }, hoje);
  assert.equal(alterado.automovelId, '2');
  banco.pedidos[0].status = 'APROVADO';
  await assert.rejects(pedidoService.modificarComoAgente(id, dados, hoje), ErroValidacao);
});

test('listar filtra por status', async () => {
  await pedidoService.criar('7', dados, hoje);
  await pedidoService.criar('8', { ...dados, automovelId: '2' }, hoje);
  banco.pedidos[1].status = 'APROVADO';
  assert.equal((await pedidoService.listar({ status: 'APROVADO' })).length, 1);
  assert.equal((await pedidoService.listar()).length, 2);
});

test('avaliar exige a decisão do Parecer', async () => {
  const { id } = await pedidoService.criar('7', dados, hoje);
  await pedidoService.iniciarAnalise(id, '5');
  await assert.rejects(pedidoService.avaliar(id, '5', { justificativa: 'ok' }, hoje), ErroValidacao);
});

test('modificarComoAgente altera Pedido PENDENTE', async () => {
  const { id } = await pedidoService.criar('7', dados, hoje);
  const alterado = await pedidoService.modificarComoAgente(id, { ...dados, dataFim: '2026-12-20' }, hoje);
  assert.equal(alterado.dataFim, '2026-12-20');
});
