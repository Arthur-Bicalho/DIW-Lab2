import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync, mkdtempSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import handler from '../api/index.js';
import { criarApi } from '../servidor/api.js';
import { recurso } from '../src/shared/api.js';

const caminhoDb = new URL('../db.json', import.meta.url);
const lerDb = () => readFileSync(caminhoDb, 'utf8');
const seed = () => JSON.parse(lerDb());

const servidores = [];
const fetchOriginal = globalThis.fetch;

async function subir(tratador) {
  const servidor = createServer(tratador);
  await new Promise((resolver) => servidor.listen(0, '127.0.0.1', resolver));
  servidores.push(servidor);
  return `http://127.0.0.1:${servidor.address().port}`;
}

// Servidor com estado limpo e próprio, a partir de uma cópia do seed.
async function subirIsolado(dados = seed()) {
  const app = criarApi(dados);
  return subir((req, res) => app.handler(req, res));
}

const json = (corpo) => ({
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(corpo),
});

after(async () => {
  globalThis.fetch = fetchOriginal;
  await Promise.all(servidores.map((s) => new Promise((resolver) => {
    s.closeAllConnections?.();
    s.close(resolver);
  })));
});

test('a Function (api/index.js) devolve o pedido 5 do seed como CONTRATADO', async () => {
  const base = await subir(handler);
  const resposta = await fetch(`${base}/pedidos/5`);
  assert.equal(resposta.status, 200);
  assert.equal((await resposta.json()).status, 'CONTRATADO');
});

test('a Function lista os usuários do seed, incluindo ana@email.com (CLIENTE)', async () => {
  const base = await subir(handler);
  const usuarios = await (await fetch(`${base}/usuarios`)).json();
  // Sem fixar a contagem: a instância da Function é única no módulo e outro teste pode ter criado usuários.
  assert.ok(usuarios.length >= 6);
  const ana = usuarios.find((u) => u.email === 'ana@email.com');
  assert.ok(ana);
  assert.equal(ana.perfil, 'CLIENTE');
});

test('POST /pedidos cria o pedido e devolve 201 com id', async () => {
  const base = await subirIsolado();
  const resposta = await fetch(`${base}/pedidos`, { method: 'POST', ...json({ clienteId: '1', status: 'PENDENTE' }) });
  assert.equal(resposta.status, 201);
  const criado = await resposta.json();
  assert.ok(criado.id);
  const lido = await (await fetch(`${base}/pedidos/${criado.id}`)).json();
  assert.equal(lido.status, 'PENDENTE');
});

test('PATCH /pedidos/:id altera apenas os campos enviados', async () => {
  const base = await subirIsolado();
  const resposta = await fetch(`${base}/pedidos/1`, { method: 'PATCH', ...json({ status: 'APROVADO' }) });
  assert.equal(resposta.status, 200);
  const atualizado = await (await fetch(`${base}/pedidos/1`)).json();
  assert.equal(atualizado.status, 'APROVADO');
  assert.equal(atualizado.clienteId, '1');
});

test('DELETE remove o pedido e o GET seguinte devolve 404', async () => {
  const base = await subirIsolado();
  const remocao = await fetch(`${base}/pedidos/1`, { method: 'DELETE' });
  assert.ok(remocao.status === 200 || remocao.status === 204);
  assert.equal((await fetch(`${base}/pedidos/1`)).status, 404);
});

test('um id inexistente devolve 404', async () => {
  const base = await subirIsolado();
  assert.equal((await fetch(`${base}/pedidos/9999`)).status, 404);
});

test('cada criarApi volta ao seed: gravar em uma instância não afeta outra nem o objeto de entrada', async () => {
  const dados = seed();
  const copiaOriginal = structuredClone(dados);
  const baseA = await subirIsolado(dados);
  const baseB = await subirIsolado(dados);

  await fetch(`${baseA}/pedidos/1`, { method: 'PATCH', ...json({ status: 'CANCELADO' }) });
  await fetch(`${baseA}/pedidos`, { method: 'POST', ...json({ clienteId: '9' }) });

  assert.equal((await (await fetch(`${baseA}/pedidos/1`)).json()).status, 'CANCELADO');
  assert.equal((await (await fetch(`${baseB}/pedidos/1`)).json()).status, 'PENDENTE');
  assert.equal((await (await fetch(`${baseB}/pedidos`)).json()).length, 6);
  assert.deepEqual(dados, copiaOriginal);
});

test('a Function não grava em disco: o db.json permanece idêntico', async () => {
  const antes = lerDb();
  const base = await subirIsolado();
  await fetch(`${base}/pedidos`, { method: 'POST', ...json({ clienteId: '1' }) });
  await fetch(`${base}/pedidos/2`, { method: 'PATCH', ...json({ status: 'APROVADO' }) });
  await fetch(`${base}/pedidos/3`, { method: 'DELETE' });

  const baseFuncao = await subir(handler);
  await fetch(`${baseFuncao}/usuarios`, { method: 'POST', ...json({ nome: 'Temporário', email: `temporario-${Date.now()}@email.com` }) });

  assert.equal(lerDb(), antes);
});

test('o JSON Server filtra ?clienteId=1 de forma estrita e devolve lista vazia', async () => {
  const base = await subirIsolado();
  assert.deepEqual(await (await fetch(`${base}/pedidos?clienteId=1`)).json(), []);
});

test('recurso("pedidos").listar filtra no cliente e devolve os 2 pedidos do cliente 1', async () => {
  const base = await subirIsolado();
  globalThis.fetch = (caminho, opcoes) => fetchOriginal(`${base}${caminho}`, opcoes);
  try {
    const pedidos = await recurso('pedidos').listar({ clienteId: '1' });
    assert.equal(pedidos.length, 2);
    assert.ok(pedidos.every((p) => String(p.clienteId) === '1'));
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

test('a API não serve arquivos estáticos: /public/login.html devolve 404', async () => {
  const base = await subirIsolado();
  const resposta = await fetch(`${base}/public/login.html`);
  assert.equal(resposta.status, 404);
  assert.ok(!(resposta.headers.get('content-type') ?? '').includes('text/html'));
});

// Em produção o JSON Server (sirv) escaneia `public` relativo ao cwd ao criar o app.
// Na Function só existem os arquivos do includeFiles do vercel.json, então o cwd simulado
// é montado só com eles. Sem `public/` o carregamento falha com ENOENT (FUNCTION_INVOCATION_FAILED).
const raiz = fileURLToPath(new URL('..', import.meta.url));
const incluidos = () => {
  const { includeFiles } = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8')).functions['api/index.js'];
  return includeFiles.replace(/^\{|\}$/g, '').split(',');
};

function rodarComoFunction(arquivos) {
  const cwd = mkdtempSync(join(tmpdir(), 'function-'));
  try {
    for (const arquivo of arquivos) {
      mkdirSync(dirname(join(cwd, arquivo)), { recursive: true });
      copyFileSync(join(raiz, arquivo), join(cwd, arquivo));
    }
    const script = `
      const { createServer } = await import('node:http');
      const { default: handler } = await import(${JSON.stringify(new URL('../api/index.js', import.meta.url).href)});
      const servidor = createServer(handler).listen(0, '127.0.0.1', async () => {
        const r = await fetch('http://127.0.0.1:' + servidor.address().port + '/pedidos/5');
        console.log(JSON.stringify({ status: r.status, corpo: await r.json() }));
        servidor.close(); servidor.closeAllConnections();
      });`;
    return spawnSync(process.execPath, ['--input-type=module', '-e', script], {
      cwd, env: { ...process.env, NODE_ENV: 'production' }, encoding: 'utf8',
    });
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}

test('vercel.json inclui db.json e a pasta public na Function', () => {
  const lista = incluidos();
  assert.ok(lista.includes('db.json'));
  assert.ok(lista.some((a) => a.startsWith('public/')));
});

test('em produção, só com os arquivos do includeFiles, a Function responde GET /pedidos/5', () => {
  const filho = rodarComoFunction(incluidos());
  assert.equal(filho.status, 0, filho.stderr);
  const { status, corpo } = JSON.parse(filho.stdout);
  assert.equal(status, 200);
  assert.equal(corpo.status, 'CONTRATADO');
});

test('em produção, sem public/ no cwd, o JSON Server falha com ENOENT (causa do 500)', () => {
  const filho = rodarComoFunction(['db.json']);
  assert.notEqual(filho.status, 0);
  assert.match(filho.stderr, /ENOENT.*public/);
});
