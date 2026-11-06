import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  agentePodeFirmarContrato, descreverContrato, tiposPropriedadePermitidos, validarContrato, validarContratoCredito, podeConcederCredito, proprietarioDoAutomovel,
} from '../src/pedidos-contratos/regras/contrato.js';

const empresa = { id: '4', perfil: 'EMPRESA' };
const banco = { id: '5', perfil: 'BANCO' };

test('só o Agente responsável firma Contrato de Pedido APROVADO', () => {
  const pedido = { status: 'APROVADO', agenteId: '5' };
  assert.equal(agentePodeFirmarContrato(pedido, '5'), true);
  assert.equal(agentePodeFirmarContrato(pedido, '4'), false);
  assert.equal(agentePodeFirmarContrato({ status: 'EM_ANALISE', agenteId: '5' }, '5'), false);
});

test('validarContrato exige Tipo de Propriedade conhecido', () => {
  assert.ok(validarContrato({ tipoPropriedade: 'OUTRO' }, banco).tipoPropriedade);
  assert.ok(validarContrato({}, banco).tipoPropriedade);
  assert.deepEqual(validarContrato({ tipoPropriedade: 'CLIENTE' }, banco), {});
});

test('EMPRESA e BANCO como Proprietário exigem o Agente do mesmo tipo (ADR 0003)', () => {
  assert.deepEqual(validarContrato({ tipoPropriedade: 'EMPRESA' }, empresa), {});
  assert.ok(validarContrato({ tipoPropriedade: 'EMPRESA' }, banco).tipoPropriedade);
  assert.deepEqual(validarContrato({ tipoPropriedade: 'BANCO' }, banco), {});
  assert.ok(validarContrato({ tipoPropriedade: 'BANCO' }, empresa).tipoPropriedade);
});

test('só Banco concede Contrato de Crédito', () => {
  assert.equal(podeConcederCredito('BANCO'), true);
  assert.equal(podeConcederCredito('EMPRESA'), false);
  assert.equal(podeConcederCredito('CLIENTE'), false);
});

test('validarContratoCredito exige valor, parcelas inteiras e juros não negativos', () => {
  assert.deepEqual(validarContratoCredito({ valor: 18000, parcelas: 12, taxaJurosMensal: 1.9 }), {});
  assert.deepEqual(validarContratoCredito({ valor: '18000', parcelas: '12', taxaJurosMensal: '0' }), {});
  const erros = validarContratoCredito({ valor: 0, parcelas: 1.5, taxaJurosMensal: -1 });
  assert.ok(erros.valor && erros.parcelas && erros.taxaJurosMensal);
  assert.ok(validarContratoCredito({ valor: 100, parcelas: 3, taxaJurosMensal: '' }).taxaJurosMensal);
});

test('proprietarioDoAutomovel aponta o Cliente, a Empresa ou o Banco do Contrato', () => {
  const pedido = { clienteId: '1' };
  assert.deepEqual(proprietarioDoAutomovel('CLIENTE', pedido, banco), { tipo: 'CLIENTE', id: '1' });
  assert.deepEqual(proprietarioDoAutomovel('EMPRESA', pedido, empresa), { tipo: 'EMPRESA', id: '4' });
  assert.deepEqual(proprietarioDoAutomovel('BANCO', pedido, banco), { tipo: 'BANCO', id: '5' });
});

test('descreverContrato resume propriedade e crédito', () => {
  assert.equal(
    descreverContrato({ tipoPropriedade: 'CLIENTE', contratoCredito: null }),
    'Automóvel de propriedade de cliente',
  );
  assert.match(
    descreverContrato({ tipoPropriedade: 'BANCO', contratoCredito: { valor: 18000, parcelas: 12, taxaJurosMensal: 1.9 } }),
    /Crédito de .*18\.000,00 em 12x, 1,9% ao mês$/,
  );
});

test('tiposPropriedadePermitidos oferece Cliente e o perfil do Agente', () => {
  assert.deepEqual(tiposPropriedadePermitidos('BANCO'), ['CLIENTE', 'BANCO']);
  assert.deepEqual(tiposPropriedadePermitidos('EMPRESA'), ['CLIENTE', 'EMPRESA']);
});
