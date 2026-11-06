import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { clienteService } from '../src/pedidos-contratos/services/clienteService.js';
import { ErroValidacao } from '../src/pedidos-contratos/regras/validacoes.js';

let banco;

beforeEach(() => {
  banco = { usuarios: [], pedidos: [] };
  globalThis.fetch = async (url, opcoes = {}) => {
    const [caminho, consulta = ''] = url.slice(1).split('?');
    const [colecao, id] = caminho.split('/');
    const filtros = Object.fromEntries(new URLSearchParams(consulta));
    const resposta = (dados) => ({ ok: true, status: 200, json: async () => dados });
    const metodo = opcoes.method ?? 'GET';

    if (metodo === 'POST') {
      const novo = { id: String(banco[colecao].length + 1), ...JSON.parse(opcoes.body) };
      banco[colecao].push(novo);
      return resposta(novo);
    }
    if (metodo === 'GET' && id) {
      return resposta(banco[colecao].find((i) => i.id === id));
    }
    if (metodo === 'DELETE') {
      banco[colecao] = banco[colecao].filter((i) => i.id !== id);
      return resposta({});
    }
    return resposta(
      banco[colecao].filter((i) => Object.entries(filtros).every(([k, v]) => String(i[k]) === v)),
    );
  };
});

const dados = () => ({
  nome: 'Ana', email: 'ana@email.com', senha: '123456', rg: 'MG-1', cpf: '529.982.247-25',
  endereco: 'Rua A', profissao: 'Engenheira', entidadesEmpregadoras: [{ nome: 'X', rendimento: 1000 }],
});

test('criar grava o cliente com perfil CLIENTE e CPF só com dígitos', async () => {
  const cliente = await clienteService.criar(dados());
  assert.equal(cliente.perfil, 'CLIENTE');
  assert.equal(cliente.cpf, '52998224725');
});

test('criar recusa dados inválidos com ErroValidacao', async () => {
  await assert.rejects(clienteService.criar({ ...dados(), cpf: '123' }), ErroValidacao);
});

test('criar recusa CPF já cadastrado', async () => {
  await clienteService.criar(dados());
  await assert.rejects(
    clienteService.criar({ ...dados(), email: 'outro@email.com' }),
    (erro) => erro instanceof ErroValidacao && Boolean(erro.erros.cpf),
  );
});

test('criar recusa e-mail já cadastrado', async () => {
  await clienteService.criar(dados());
  await assert.rejects(
    clienteService.criar({ ...dados(), cpf: '111.444.777-35' }),
    (erro) => erro instanceof ErroValidacao && Boolean(erro.erros.email),
  );
});

test('remover recusa cliente com pedido em andamento', async () => {
  banco.usuarios.push({ id: '1', perfil: 'CLIENTE' });
  banco.pedidos.push({ id: '1', clienteId: '1', status: 'PENDENTE' });
  await assert.rejects(clienteService.remover('1'), (erro) => erro instanceof ErroValidacao && Boolean(erro.erros.geral));
});

test('remover exclui cliente sem pedidos em andamento', async () => {
  banco.usuarios.push({ id: '1', perfil: 'CLIENTE' });
  banco.pedidos.push({ id: '1', clienteId: '1', status: 'CANCELADO' });
  await clienteService.remover('1');
  assert.equal(banco.usuarios.length, 0);
});

test('remover recusa usuário que não é cliente', async () => {
  banco.usuarios.push({ id: '9', perfil: 'BANCO' });
  await assert.rejects(clienteService.remover('9'), ErroValidacao);
  assert.equal(banco.usuarios.length, 1);
});
