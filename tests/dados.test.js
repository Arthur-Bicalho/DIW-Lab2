import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CATEGORIAS_AUTOMOVEL, SEGMENTOS_AUTOMOVEL, ANO_MINIMO_AUTOMOVEL, TIPOS_PROPRIEDADE,
} from '../src/pedidos-contratos/models/constantes.js';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const db = JSON.parse(fs.readFileSync(path.join(raiz, 'db.json'), 'utf8'));
const automoveis = db.automoveis;
const pasta = path.join(raiz, 'public', 'img', 'carros');
const LICENCA_LIVRE = /^(CC0|Domínio público|CC BY(-SA)? [1-4]\.0)$/;

test('a frota tem 66 automóveis com ids de 1 a 66 sem lacuna', () => {
  assert.equal(automoveis.length, 66);
  assert.deepEqual(automoveis.map((a) => a.id), Array.from({ length: 66 }, (_, i) => String(i + 1)));
});

test('campos obrigatórios, classificação, ano e eletrico', () => {
  for (const a of automoveis) {
    for (const campo of ['matricula', 'ano', 'marca', 'modelo', 'placa', 'proprietario', 'categoria', 'segmento', 'imagem']) {
      assert.ok(a[campo], `automóvel ${a.id} sem ${campo}`);
    }
    assert.ok(a.categoria in CATEGORIAS_AUTOMOVEL, `categoria inválida em ${a.id}`);
    assert.ok(a.segmento in SEGMENTOS_AUTOMOVEL, `segmento inválido em ${a.id}`);
    assert.equal(typeof a.eletrico, 'boolean', `eletrico de ${a.id}`);
    assert.ok(Number.isInteger(a.ano) && a.ano >= ANO_MINIMO_AUTOMOVEL && a.ano <= 2026, `ano de ${a.id}`);
  }
});

test('placa e matrícula são únicas e a placa segue o formato Mercosul', () => {
  assert.equal(new Set(automoveis.map((a) => a.placa)).size, automoveis.length);
  assert.equal(new Set(automoveis.map((a) => a.matricula)).size, automoveis.length);
  for (const a of automoveis) assert.match(a.placa, /^[A-Z]{3}\d[A-Z]\d{2}$/, `placa de ${a.id}`);
});

test('o proprietário é uma Empresa ou um Banco existente', () => {
  for (const a of automoveis) {
    const { tipo, id } = a.proprietario;
    assert.ok([TIPOS_PROPRIEDADE.EMPRESA, TIPOS_PROPRIEDADE.BANCO].includes(tipo), `tipo de ${a.id}`);
    const usuario = db.usuarios.find((u) => u.id === id);
    assert.ok(usuario, `proprietário de ${a.id} não existe`);
    assert.equal(usuario.perfil, tipo, `perfil do proprietário de ${a.id}`);
  }
});

test('cada automóvel tem uma foto existente, não vazia e sem arquivo órfão', () => {
  const usados = new Set();
  for (const a of automoveis) {
    const im = a.imagem;
    assert.ok(im && typeof im === 'object' && !Array.isArray(im), `imagem de ${a.id}`);
    assert.match(im.arquivo, /^img\/carros\/[a-z0-9-]+\.jpg$/, `arquivo de ${a.id}`);
    const caminho = path.join(raiz, 'public', im.arquivo);
    assert.ok(fs.existsSync(caminho) && fs.statSync(caminho).size > 0, `arquivo ausente ou vazio: ${im.arquivo}`);
    usados.add(path.basename(im.arquivo));
  }
  assert.equal(usados.size, automoveis.length, 'cada carro usa uma foto própria');
  const emDisco = fs.readdirSync(pasta);
  const orfaos = emDisco.filter((f) => !usados.has(f));
  assert.deepEqual(orfaos, [], 'imagens que nenhum carro usa');
});

test('crédito da foto: autor, licença livre (sem NC nem ND) e fonte do Commons', () => {
  for (const a of automoveis) {
    const { legenda, autor, licenca, fonte } = a.imagem;
    assert.ok(legenda && autor && licenca && fonte, `crédito incompleto em ${a.id}`);
    assert.match(licenca, LICENCA_LIVRE, `licença de ${a.id}: ${licenca}`);
    assert.doesNotMatch(licenca, /NC|ND/, `licença restritiva em ${a.id}`);
    assert.ok(fonte.startsWith('https://commons.wikimedia.org/'), `fonte de ${a.id}`);
  }
});

test('composição da frota', () => {
  const conta = (f) => automoveis.filter(f).length;
  assert.ok(conta((a) => a.segmento === 'LUXO' && a.eletrico) >= 1, 'luxo elétrico');
  assert.ok(conta((a) => a.segmento === 'POPULAR' && a.eletrico) >= 1, 'popular elétrico');
  assert.ok(conta((a) => a.segmento === 'POPULAR') >= 20, 'populares');
  assert.ok(conta((a) => a.segmento === 'LUXO') >= 20, 'luxo');
  for (const categoria of ['HATCH', 'SEDAN', 'SUV', 'PICAPE', 'ESPORTIVO', 'MINIVAN']) {
    assert.ok(conta((a) => a.categoria === categoria) >= 1, `categoria ${categoria}`);
  }
});

test('as imagens somam menos de 12 MB', () => {
  const total = fs.readdirSync(pasta).reduce((s, f) => s + fs.statSync(path.join(pasta, f)).size, 0);
  assert.ok(total < 12 * 1024 * 1024, `total ${total} bytes`);
});

test('pedidos e contratos de exemplo referenciam automóveis existentes', () => {
  const ids = new Set(automoveis.map((a) => a.id));
  for (const p of db.pedidos) assert.ok(ids.has(p.automovelId), `pedido ${p.id}`);
  for (const c of db.contratos ?? []) {
    if (c.automovelId) assert.ok(ids.has(c.automovelId), `contrato ${c.id}`);
  }
});
