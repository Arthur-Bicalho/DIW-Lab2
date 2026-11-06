import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  filtrarAutomoveis, anosDisponiveis, categoriasDisponiveis, paginar, descricaoAutomovel, urlSegura,
} from '../src/pedidos-contratos/regras/automovel.js';

const frota = [
  { id: '1', marca: 'Fiat', modelo: 'Argo', ano: 2023, placa: 'AAA1A11', categoria: 'HATCH', segmento: 'POPULAR', eletrico: false },
  { id: '2', marca: 'Citroën', modelo: 'C3', ano: 2022, placa: 'BBB2B22', categoria: 'HATCH', segmento: 'POPULAR', eletrico: true },
  { id: '3', marca: 'BYD', modelo: 'Seal', ano: 2024, placa: 'CCC3C33', categoria: 'SEDAN', segmento: 'LUXO', eletrico: true },
  { id: '4', marca: 'BMW', modelo: 'X5', ano: 2023, placa: 'DDD4D44', categoria: 'SUV', segmento: 'LUXO', eletrico: false },
];
const ids = (lista) => lista.map((a) => a.id);

test('filtros vazios não filtram', () => {
  assert.deepEqual(ids(filtrarAutomoveis(frota, {})), ['1', '2', '3', '4']);
  assert.deepEqual(ids(filtrarAutomoveis(frota, { modelo: '', ano: '', categoria: '', segmento: '', eletrico: false })), ['1', '2', '3', '4']);
});

test('modelo casa trecho de marca ou modelo sem diferenciar caixa nem acentos', () => {
  assert.deepEqual(ids(filtrarAutomoveis(frota, { modelo: 'citroen' })), ['2']);
  assert.deepEqual(ids(filtrarAutomoveis(frota, { modelo: 'ARG' })), ['1']);
  assert.deepEqual(ids(filtrarAutomoveis(frota, { modelo: ' seal ' })), ['3']);
});

test('ano é exato e aceita texto ou número', () => {
  assert.deepEqual(ids(filtrarAutomoveis(frota, { ano: '2023' })), ['1', '4']);
  assert.deepEqual(ids(filtrarAutomoveis(frota, { ano: 2022 })), ['2']);
});

test('categoria e segmento são exatos', () => {
  assert.deepEqual(ids(filtrarAutomoveis(frota, { categoria: 'HATCH' })), ['1', '2']);
  assert.deepEqual(ids(filtrarAutomoveis(frota, { segmento: 'LUXO' })), ['3', '4']);
});

test('somente elétricos combina com luxo e com popular', () => {
  assert.deepEqual(ids(filtrarAutomoveis(frota, { segmento: 'LUXO', eletrico: true })), ['3']);
  assert.deepEqual(ids(filtrarAutomoveis(frota, { segmento: 'POPULAR', eletrico: true })), ['2']);
});

test('filtros combinam em E e podem não achar nada', () => {
  assert.deepEqual(ids(filtrarAutomoveis(frota, { categoria: 'SUV', ano: '2023', segmento: 'LUXO' })), ['4']);
  assert.deepEqual(filtrarAutomoveis(frota, { modelo: 'argo', eletrico: true }), []);
});

test('anosDisponiveis lista anos distintos do mais novo ao mais antigo', () => {
  assert.deepEqual(anosDisponiveis(frota), [2024, 2023, 2022]);
  assert.deepEqual(anosDisponiveis([]), []);
});

test('categoriasDisponiveis lista as categorias presentes, sem repetir', () => {
  assert.deepEqual(categoriasDisponiveis(frota), ['HATCH', 'SEDAN', 'SUV']);
});

const muitos = Array.from({ length: 66 }, (_, i) => ({ id: String(i + 1) }));

test('paginar divide 66 itens em 6 páginas de 12', () => {
  const p1 = paginar(muitos, 1, 12);
  assert.equal(p1.itens.length, 12);
  assert.equal(p1.totalPaginas, 6);
  assert.equal(p1.total, 66);
  assert.equal(p1.pagina, 1);
  const p6 = paginar(muitos, 6, 12);
  assert.deepEqual(ids(p6.itens), ['61', '62', '63', '64', '65', '66']);
});

test('paginar ajusta página fora do intervalo', () => {
  assert.equal(paginar(muitos, 0, 12).pagina, 1);
  assert.equal(paginar(muitos, -3, 12).pagina, 1);
  assert.equal(paginar(muitos, 99, 12).pagina, 6);
  assert.equal(paginar(muitos, 'abc', 12).pagina, 1);
  assert.equal(paginar(muitos, '2', 12).pagina, 2);
});

test('paginar lista vazia devolve uma página sem itens', () => {
  assert.deepEqual(paginar([], 1, 12), { itens: [], pagina: 1, totalPaginas: 1, total: 0 });
});

test('descricaoAutomovel inclui categoria e segmento quando existem', () => {
  assert.equal(descricaoAutomovel(frota[0]), 'Fiat Argo 2023 (AAA1A11) - Hatch, Popular');
  assert.equal(descricaoAutomovel({ marca: 'Fiat', modelo: 'Uno', ano: 2010, placa: 'X' }), 'Fiat Uno 2010 (X)');
});

test('urlSegura aceita apenas http e https', () => {
  assert.equal(urlSegura('https://commons.wikimedia.org/wiki/File:A.jpg'), 'https://commons.wikimedia.org/wiki/File:A.jpg');
  assert.equal(urlSegura('http://exemplo.com/a'), 'http://exemplo.com/a');
  assert.equal(urlSegura('javascript:alert(1)'), null);
  assert.equal(urlSegura('data:text/html,<b>x</b>'), null);
  assert.equal(urlSegura('sem url'), null);
  assert.equal(urlSegura(''), null);
  assert.equal(urlSegura(undefined), null);
});
