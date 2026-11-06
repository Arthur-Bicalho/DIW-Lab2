import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validarCpf, validarCliente, rendimentoTotal } from '../src/pedidos-contratos/regras/cliente.js';

const clienteValido = () => ({
  nome: 'Ana Souza',
  email: 'ana@email.com',
  senha: '123456',
  rg: 'MG-12.345.678',
  cpf: '529.982.247-25',
  endereco: 'Rua das Acácias, 120',
  profissao: 'Engenheira',
  entidadesEmpregadoras: [{ nome: 'Construtora Horizonte', rendimento: 9500 }],
});

test('validarCpf aceita CPF válido com ou sem máscara', () => {
  assert.equal(validarCpf('52998224725'), true);
  assert.equal(validarCpf('529.982.247-25'), true);
});

test('validarCpf recusa dígito verificador errado, tamanho errado e repetições', () => {
  assert.equal(validarCpf('52998224726'), false);
  assert.equal(validarCpf('123'), false);
  assert.equal(validarCpf('11111111111'), false);
  assert.equal(validarCpf(''), false);
});

test('validarCliente não devolve erros para um cliente válido', () => {
  assert.deepEqual(validarCliente(clienteValido()), {});
});

test('validarCliente exige os campos obrigatórios', () => {
  const erros = validarCliente({ entidadesEmpregadoras: [] });
  for (const campo of ['nome', 'email', 'senha', 'rg', 'cpf', 'endereco', 'profissao']) {
    assert.ok(erros[campo], `esperava erro em ${campo}`);
  }
});

test('validarCliente recusa CPF inválido', () => {
  const erros = validarCliente({ ...clienteValido(), cpf: '111.111.111-11' });
  assert.ok(erros.cpf);
});

test('validarCliente aceita 3 entidades empregadoras e recusa 4', () => {
  const entidade = { nome: 'Empresa', rendimento: 1000 };
  assert.deepEqual(validarCliente({ ...clienteValido(), entidadesEmpregadoras: [entidade, entidade, entidade] }), {});
  const erros = validarCliente({ ...clienteValido(), entidadesEmpregadoras: [entidade, entidade, entidade, entidade] });
  assert.ok(erros.entidadesEmpregadoras);
});

test('validarCliente exige nome e rendimento positivo em cada entidade empregadora', () => {
  const erros = validarCliente({
    ...clienteValido(),
    entidadesEmpregadoras: [{ nome: '', rendimento: 0 }],
  });
  assert.ok(erros.entidadesEmpregadoras);
});

test('validarCliente na edição não exige senha', () => {
  const { senha, ...semSenha } = clienteValido();
  assert.deepEqual(validarCliente(semSenha, { edicao: true }), {});
});

test('rendimentoTotal soma os rendimentos das entidades empregadoras', () => {
  assert.equal(rendimentoTotal([{ rendimento: 9500 }, { rendimento: '2500' }]), 12000);
  assert.equal(rendimentoTotal([]), 0);
});
