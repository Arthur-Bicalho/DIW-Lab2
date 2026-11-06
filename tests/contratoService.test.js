import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { instalarBancoFalso } from './apoio/bancoFalso.js';
import { contratoService } from '../src/pedidos-contratos/services/contratoService.js';
import { ErroValidacao } from '../src/pedidos-contratos/regras/erros.js';

const hoje = '2026-11-06';
const banco5 = { id: '5', perfil: 'BANCO' };
const empresa4 = { id: '4', perfil: 'EMPRESA' };
const credito = { valor: 18000, parcelas: 12, taxaJurosMensal: 1.9 };
let bd;

beforeEach(() => {
  bd = instalarBancoFalso(['pedidos', 'automoveis', 'contratos']);
  bd.pedidos.push({ id: '1', clienteId: '7', automovelId: '1', status: 'APROVADO', agenteId: '5' });
  bd.automoveis.push({ id: '1', proprietario: { tipo: 'EMPRESA', id: '4' } });
});

test('firmar cria o Contrato, contrata o Pedido e atualiza o Proprietário do Automóvel', async () => {
  const contrato = await contratoService.firmar('1', banco5, { tipoPropriedade: 'CLIENTE' }, hoje);
  assert.equal(contrato.pedidoId, '1');
  assert.equal(contrato.contratoCredito, null);
  assert.equal(bd.pedidos[0].status, 'CONTRATADO');
  assert.deepEqual(bd.automoveis[0].proprietario, { tipo: 'CLIENTE', id: '7' });
});

test('firmar por Banco grava o Contrato de Crédito com o Banco concedente', async () => {
  const contrato = await contratoService.firmar('1', banco5, { tipoPropriedade: 'BANCO', credito }, hoje);
  assert.deepEqual(contrato.contratoCredito, { bancoId: '5', ...credito });
});

test('firmar por Empresa recusa Contrato de Crédito', async () => {
  bd.pedidos[0].agenteId = '4';
  await assert.rejects(
    contratoService.firmar('1', empresa4, { tipoPropriedade: 'EMPRESA', credito }, hoje),
    (erro) => erro instanceof ErroValidacao && Boolean(erro.erros.geral),
  );
  assert.equal(bd.contratos.length, 0);
});

test('firmar recusa crédito inválido sem alterar nada', async () => {
  await assert.rejects(
    contratoService.firmar('1', banco5, { tipoPropriedade: 'BANCO', credito: { ...credito, parcelas: 0 } }, hoje),
    ErroValidacao,
  );
  assert.equal(bd.pedidos[0].status, 'APROVADO');
});

test('firmar recusa Pedido que não está APROVADO ou de outro Agente', async () => {
  await assert.rejects(contratoService.firmar('1', { id: '6', perfil: 'BANCO' }, { tipoPropriedade: 'CLIENTE' }, hoje), ErroValidacao);
  bd.pedidos[0].status = 'EM_ANALISE';
  await assert.rejects(contratoService.firmar('1', banco5, { tipoPropriedade: 'CLIENTE' }, hoje), ErroValidacao);
});

test('firmar recusa Tipo de Propriedade incompatível com o Agente', async () => {
  await assert.rejects(contratoService.firmar('1', banco5, { tipoPropriedade: 'EMPRESA' }, hoje), ErroValidacao);
});

test('firmar recusa segundo Contrato para o mesmo Pedido', async () => {
  await contratoService.firmar('1', banco5, { tipoPropriedade: 'CLIENTE' }, hoje);
  bd.pedidos[0].status = 'APROVADO';
  await assert.rejects(
    contratoService.firmar('1', banco5, { tipoPropriedade: 'CLIENTE' }, hoje),
    (erro) => erro instanceof ErroValidacao && Boolean(erro.erros.geral),
  );
  assert.equal(bd.contratos.length, 1);
});
