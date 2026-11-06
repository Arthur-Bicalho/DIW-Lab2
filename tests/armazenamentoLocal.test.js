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

// Sincronização do catálogo de automóveis com a semente

const IMAGEM = (n) => ({ arquivo: `img/carros/${n}.jpg`, legenda: `Carro ${n}`, autor: 'A', licenca: 'CC', fonte: 'https://x' });
const carroSemente = (n) => ({
  id: String(n), matricula: `MAT-${n}`, ano: 2020, marca: 'M', modelo: `Mod${n}`, placa: `PL${n}`,
  categoria: 'SEDAN', segmento: 'POPULAR', eletrico: false, imagem: IMAGEM(n), proprietario: { tipo: 'EMPRESA', id: String(n) },
});
const carroAntigo = (n) => ({
  id: String(n), matricula: `MAT-${n}`, ano: 2020, marca: 'M', modelo: `Mod${n}`, placa: `PL${n}`,
  proprietario: { tipo: 'EMPRESA', id: String(n) },
});
const SEMENTE_FROTA = {
  usuarios: [{ id: '1', nome: 'Ana' }],
  automoveis: Array.from({ length: 66 }, (_, i) => carroSemente(i + 1)),
  pedidos: [{ id: '1', status: 'PENDENTE' }],
  contratos: [],
};

function instalarComSemente(semente, { falha = null } = {}) {
  instalar();
  globalThis.fetch = async (url) => {
    chamadasFetch.push(url);
    await new Promise((r) => setTimeout(r, 5));
    if (falha === 'rejeita') throw new Error('offline');
    if (falha === '404') return { ok: false, status: 404, json: async () => ({}) };
    return { ok: true, status: 200, json: async () => structuredClone(semente) };
  };
}

function gravar(colecao, itens) {
  globalThis.localStorage.setItem(`aluguel:v1:${colecao}`, JSON.stringify(itens));
}
function ler(colecao) {
  return JSON.parse(globalThis.localStorage.getItem(`aluguel:v1:${colecao}`));
}

test('automoveis antigos (sem imagem) são atualizados com a frota da semente', async () => {
  instalarComSemente(SEMENTE_FROTA);
  gravar('automoveis', [1, 2, 3, 4, 5, 6].map(carroAntigo));
  const lista = await recursoLocal('automoveis').listar();
  assert.equal(lista.length, 66);
  for (const carro of lista) {
    assert.ok(carro.imagem?.arquivo, `carro ${carro.id} sem imagem`);
    assert.ok(carro.categoria);
    assert.ok(carro.segmento);
    assert.equal(typeof carro.eletrico, 'boolean');
  }
  assert.equal(ler('automoveis').length, 66);
});

test('proprietário gravado localmente prevalece sobre o da semente', async () => {
  instalarComSemente(SEMENTE_FROTA);
  const antigos = [1, 2, 3, 4, 5, 6].map(carroAntigo);
  antigos[3].proprietario = { tipo: 'CLIENTE', id: '9' };
  gravar('automoveis', antigos);
  const carro = await recursoLocal('automoveis').obter('4');
  assert.deepEqual(carro.proprietario, { tipo: 'CLIENTE', id: '9' });
  assert.ok(carro.imagem);
  // a mudança continua depois de uma atualização posterior
  await recursoLocal('automoveis').atualizar('4', { proprietario: { tipo: 'CLIENTE', id: '7' } });
  assert.deepEqual((await recursoLocal('automoveis').obter('4')).proprietario, { tipo: 'CLIENTE', id: '7' });
  assert.deepEqual((await recursoLocal('automoveis').obter('5')).proprietario, { tipo: 'EMPRESA', id: '5' });
});

test('usuários, pedidos e contratos do navegador não são alterados', async () => {
  instalarComSemente(SEMENTE_FROTA);
  const usuarios = [{ id: '1', nome: 'Antiga' }, { id: 'abc', nome: 'Criado Local' }];
  const pedidos = [{ id: '1', status: 'APROVADO' }, { id: 'xyz', status: 'PENDENTE' }];
  const contratos = [{ id: 'c1', pedidoId: 'xyz' }];
  gravar('usuarios', usuarios);
  gravar('pedidos', pedidos);
  gravar('contratos', contratos);
  gravar('automoveis', [1, 2].map(carroAntigo));
  await recursoLocal('automoveis').listar();
  assert.deepEqual(await recursoLocal('usuarios').listar(), usuarios);
  assert.deepEqual(await recursoLocal('pedidos').listar(), pedidos);
  assert.deepEqual(await recursoLocal('contratos').listar(), contratos);
});

test('carro que só existe no navegador é mantido', async () => {
  instalarComSemente(SEMENTE_FROTA);
  const local = { ...carroAntigo(900), id: 'local1' };
  gravar('automoveis', [carroAntigo(1), local]);
  const lista = await recursoLocal('automoveis').listar();
  assert.equal(lista.length, 67);
  assert.deepEqual(lista.find((c) => c.id === 'local1'), local);
});

for (const falha of ['rejeita', '404']) {
  test(`semente indisponível (${falha}) devolve a lista gravada sem erro`, async () => {
    instalarComSemente(SEMENTE_FROTA, { falha });
    const antigos = [1, 2, 3].map(carroAntigo);
    gravar('automoveis', antigos);
    assert.deepEqual(await recursoLocal('automoveis').listar(), antigos);
    assert.deepEqual(ler('automoveis'), antigos);
  });
}

test('uma única requisição ao /db.json com leituras concorrentes', async () => {
  instalarComSemente(SEMENTE_FROTA);
  gravar('automoveis', [1, 2].map(carroAntigo));
  await Promise.all([
    recursoLocal('automoveis').listar(),
    recursoLocal('automoveis').obter('1'),
    recursoLocal('usuarios').listar(),
    recursoLocal('pedidos').listar(),
  ]);
  await recursoLocal('automoveis').listar();
  assert.equal(chamadasFetch.length, 1);
});

test('não repete a sincronização a cada leitura', async () => {
  instalarComSemente(SEMENTE_FROTA);
  gravar('automoveis', [1, 2].map(carroAntigo));
  await recursoLocal('automoveis').listar();
  // alteração local posterior não é desfeita por novas leituras
  await recursoLocal('automoveis').atualizar('1', { marca: 'Editada' });
  assert.equal((await recursoLocal('automoveis').obter('1')).marca, 'Editada');
  assert.equal(chamadasFetch.length, 1);
});

test('automoveis ausente continua carregado da semente', async () => {
  instalarComSemente(SEMENTE_FROTA);
  const lista = await recursoLocal('automoveis').listar();
  assert.equal(lista.length, 66);
  assert.deepEqual(ler('usuarios'), SEMENTE_FROTA.usuarios);
  assert.equal(chamadasFetch.length, 1);
});

test('automoveis ausente e sem semente mantém o erro', async () => {
  instalarComSemente(SEMENTE_FROTA, { falha: '404' });
  await assert.rejects(recursoLocal('automoveis').listar(), ErroApi);
});

test('não grava no localStorage se nada mudou', async () => {
  instalarComSemente(SEMENTE_FROTA);
  gravar('automoveis', structuredClone(SEMENTE_FROTA.automoveis));
  let gravacoes = 0;
  const setOriginal = globalThis.localStorage.setItem.bind(globalThis.localStorage);
  globalThis.localStorage.setItem = (chave, valor) => { gravacoes++; setOriginal(chave, valor); };
  await recursoLocal('automoveis').listar();
  assert.equal(gravacoes, 0);
});

test('restaurarDadosDeExemplo reinicia a sincronização', async () => {
  instalarComSemente(SEMENTE_FROTA);
  gravar('automoveis', [1, 2].map(carroAntigo));
  await recursoLocal('automoveis').listar();
  restaurarDadosDeExemplo();
  gravar('automoveis', [1, 2].map(carroAntigo));
  assert.equal((await recursoLocal('automoveis').listar()).length, 66);
  assert.equal(chamadasFetch.length, 2);
});
