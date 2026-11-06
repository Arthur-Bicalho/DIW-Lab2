import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requisitar, recurso, ErroApi } from '../src/shared/api.js';

function simularFetch(resposta) {
  const chamadas = [];
  globalThis.fetch = async (url, opcoes) => {
    chamadas.push({ url, opcoes });
    if (resposta instanceof Error) throw resposta;
    return resposta;
  };
  return chamadas;
}

const ok = (dados) => ({ ok: true, status: 200, json: async () => dados });

test('requisitar devolve o JSON da resposta', async () => {
  simularFetch(ok([{ id: '1' }]));
  assert.deepEqual(await requisitar('/pedidos'), [{ id: '1' }]);
});

test('requisitar lança ErroApi com o status quando a resposta não é ok', async () => {
  simularFetch({ ok: false, status: 404 });
  await assert.rejects(requisitar('/pedidos/9'), (erro) => erro instanceof ErroApi && erro.status === 404);
});

test('requisitar lança ErroApi quando o servidor está fora do ar', async () => {
  simularFetch(new TypeError('failed'));
  await assert.rejects(requisitar('/pedidos'), ErroApi);
});

test('requisitar devolve null em resposta 204', async () => {
  simularFetch({ ok: true, status: 204 });
  assert.equal(await requisitar('/pedidos/1', { metodo: 'DELETE' }), null);
});

test('recurso.listar filtra no cliente comparando como texto', async () => {
  simularFetch(ok([{ id: '1', clienteId: '1' }, { id: '2', clienteId: '2' }]));
  assert.deepEqual(await recurso('pedidos').listar({ clienteId: 1 }), [{ id: '1', clienteId: '1' }]);
});

test('recurso.criar envia o corpo como JSON com POST', async () => {
  const chamadas = simularFetch(ok({ id: '2' }));
  await recurso('pedidos').criar({ status: 'PENDENTE' });
  assert.equal(chamadas[0].opcoes.method, 'POST');
  assert.equal(chamadas[0].opcoes.body, '{"status":"PENDENTE"}');
});
