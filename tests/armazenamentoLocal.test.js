import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { recursoLocal, restaurarDadosDeExemplo } from '../src/shared/armazenamento-local.js';
import { recurso, ErroApi } from '../src/shared/api.js';

const SEMENTE = {
  usuarios: [{ id: '1', nome: 'Ana', clienteId: 1 }],
  pedidos: [{ id: '1', clienteId: '1', status: 'PENDENTE' }, { id: '2', clienteId: '2', status: 'PENDENTE' }],
};

class LocalStorageFalso {
  #dados = new Map();
  get length() { return this.#dados.size; }
  key(i) { return [...this.#dados.keys()][i] ?? null; }
  getItem(chave) { return this.#dados.has(chave) ? this.#dados.get(chave) : null; }
  setItem(chave, valor) { this.#dados.set(chave, String(valor)); }
  removeItem(chave) { this.#dados.delete(chave); }
}

const original = { fetch: globalThis.fetch, descritor: Object.getOwnPropertyDescriptor(globalThis, 'localStorage') };
let chamadasFetch;

function instalar() {
  chamadasFetch = [];
  Object.defineProperty(globalThis, 'localStorage', { value: new LocalStorageFalso(), configurable: true, writable: true });
  globalThis.fetch = async (url) => {
    chamadasFetch.push(url);
    await new Promise((r) => setTimeout(r, 5));
    return { ok: true, status: 200, json: async () => structuredClone(SEMENTE) };
  };
  restaurarDadosDeExemplo();
}

afterEach(() => {
  globalThis.fetch = original.fetch;
  if (original.descritor) Object.defineProperty(globalThis, 'localStorage', original.descritor);
  else delete globalThis.localStorage;
});

test('listar carrega o seed e devolve a coleção', async () => {
  instalar();
  assert.deepEqual(await recursoLocal('pedidos').listar(), SEMENTE.pedidos);
  assert.deepEqual(chamadasFetch, ['/db.json']);
});

test('listar filtra comparando como texto', async () => {
  instalar();
  assert.deepEqual(await recursoLocal('pedidos').listar({ clienteId: 1 }), [SEMENTE.pedidos[0]]);
});

test('seed é buscado uma única vez mesmo com chamadas concorrentes', async () => {
  instalar();
  await Promise.all([recursoLocal('pedidos').listar(), recursoLocal('usuarios').listar(), recursoLocal('pedidos').obter('1')]);
  assert.equal(chamadasFetch.length, 1);
  await recursoLocal('usuarios').listar();
  assert.equal(chamadasFetch.length, 1);
});

test('criar gera id em texto único e persiste', async () => {
  instalar();
  const pedidos = recursoLocal('pedidos');
  const a = await pedidos.criar({ status: 'PENDENTE' });
  const b = await pedidos.criar({ status: 'PENDENTE' });
  assert.equal(typeof a.id, 'string');
  assert.notEqual(a.id, b.id);
  assert.deepEqual(await pedidos.obter(a.id), a);
  assert.equal((await pedidos.listar()).length, 4);
});

test('atualizar faz merge dos campos', async () => {
  instalar();
  const pedidos = recursoLocal('pedidos');
  const atualizado = await pedidos.atualizar('1', { status: 'APROVADO' });
  assert.deepEqual(atualizado, { id: '1', clienteId: '1', status: 'APROVADO' });
  assert.deepEqual(await pedidos.obter('1'), atualizado);
});

test('remover apaga o item e devolve null', async () => {
  instalar();
  const pedidos = recursoLocal('pedidos');
  assert.equal(await pedidos.remover('1'), null);
  assert.deepEqual(await pedidos.listar(), [SEMENTE.pedidos[1]]);
});

test('id inexistente lança ErroApi 404 em obter, atualizar e remover', async () => {
  instalar();
  const pedidos = recursoLocal('pedidos');
  for (const operacao of [() => pedidos.obter('x'), () => pedidos.atualizar('x', {}), () => pedidos.remover('x')]) {
    await assert.rejects(operacao(), (e) => e instanceof ErroApi && e.status === 404);
  }
});

test('dados persistem entre instâncias de recursoLocal', async () => {
  instalar();
  const criado = await recursoLocal('pedidos').criar({ status: 'PENDENTE' });
  assert.deepEqual(await recursoLocal('pedidos').obter(criado.id), criado);
});

test('restaurarDadosDeExemplo limpa as alterações e recarrega o seed', async () => {
  instalar();
  await recursoLocal('pedidos').remover('1');
  restaurarDadosDeExemplo();
  assert.deepEqual(await recursoLocal('pedidos').listar(), SEMENTE.pedidos);
  assert.equal(chamadasFetch.length, 2);
});

test('falha ao gravar vira ErroApi com mensagem clara', async () => {
  instalar();
  const pedidos = recursoLocal('pedidos');
  await pedidos.listar();
  globalThis.localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
  await assert.rejects(pedidos.criar({}), (e) => e instanceof ErroApi && /armazenamento cheio/.test(e.message));
});

test('localStorage indisponível lança ErroApi', async () => {
  instalar();
  delete globalThis.localStorage;
  await assert.rejects(recursoLocal('pedidos').listar(), ErroApi);
});

test('recurso de api.js usa fetch no modo api', async () => {
  instalar();
  globalThis.fetch = async (url) => {
    chamadasFetch.push(url);
    return { ok: true, status: 200, json: async () => [] };
  };
  await recurso('pedidos').listar();
  assert.deepEqual(chamadasFetch, ['/pedidos']);
  assert.equal(globalThis.localStorage.length, 0);
});
