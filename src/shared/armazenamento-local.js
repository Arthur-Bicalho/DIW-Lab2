import { ErroApi } from './erro-api.js';

const PREFIXO = 'aluguel:v1:';

// Uma única requisição ao seed, compartilhada por chamadas concorrentes.
let semente = null;

function armazenamento() {
  try {
    if (globalThis.localStorage) return globalThis.localStorage;
  } catch {
    // o acesso ao localStorage pode lançar exceção quando bloqueado
  }
  throw new ErroApi('O armazenamento do navegador está indisponível. Libere o armazenamento do site para continuar.');
}

function gravarColecao(nome, itens) {
  try {
    armazenamento().setItem(PREFIXO + nome, JSON.stringify(itens));
  } catch (erro) {
    if (erro instanceof ErroApi) throw erro;
    throw new ErroApi('Não foi possível salvar os dados no navegador (armazenamento cheio ou bloqueado).');
  }
}

function carregarSemente() {
  semente ??= fetch('/db.json')
    .then((resposta) => {
      if (!resposta.ok) throw new Error('falha');
      return resposta.json();
    })
    .catch(() => {
      semente = null;
      throw new ErroApi('Não foi possível carregar os dados de exemplo.');
    });
  return semente;
}

async function lerColecao(nome) {
  const bruto = armazenamento().getItem(PREFIXO + nome);
  if (bruto !== null) {
    try {
      return JSON.parse(bruto);
    } catch {
      throw new ErroApi('Os dados salvos no navegador estão corrompidos. Restaure os dados de exemplo.');
    }
  }
  const dados = await carregarSemente();
  // Re-checa: outra chamada concorrente pode ter gravado enquanto esperava o seed.
  if (armazenamento().getItem(PREFIXO + nome) === null) {
    for (const [colecao, itens] of Object.entries(dados)) {
      if (armazenamento().getItem(PREFIXO + colecao) === null) gravarColecao(colecao, itens);
    }
    if (armazenamento().getItem(PREFIXO + nome) === null) gravarColecao(nome, []);
  }
  return JSON.parse(armazenamento().getItem(PREFIXO + nome));
}

function gerarId() {
  return Math.random().toString(36).slice(2, 6) + Math.random().toString(36).slice(2, 6);
}

const naoEncontrado = () => new ErroApi('Falha na requisição (404).', 404);

export function recursoLocal(nome) {
  return {
    async listar(filtros = {}) {
      const itens = await lerColecao(nome);
      return itens.filter((item) => Object.entries(filtros).every(([campo, valor]) => String(item[campo]) === String(valor)));
    },
    async obter(id) {
      const item = (await lerColecao(nome)).find((i) => String(i.id) === String(id));
      if (!item) throw naoEncontrado();
      return item;
    },
    async criar(dados) {
      const itens = await lerColecao(nome);
      let id;
      do { id = gerarId(); } while (itens.some((i) => String(i.id) === id));
      const novo = { ...dados, id };
      gravarColecao(nome, [...itens, novo]);
      return novo;
    },
    async atualizar(id, dados) {
      const itens = await lerColecao(nome);
      const posicao = itens.findIndex((i) => String(i.id) === String(id));
      if (posicao === -1) throw naoEncontrado();
      const atualizado = { ...itens[posicao], ...dados, id: itens[posicao].id };
      itens[posicao] = atualizado;
      gravarColecao(nome, itens);
      return atualizado;
    },
    async remover(id) {
      const itens = await lerColecao(nome);
      if (!itens.some((i) => String(i.id) === String(id))) throw naoEncontrado();
      gravarColecao(nome, itens.filter((i) => String(i.id) !== String(id)));
      return null;
    },
  };
}

export function restaurarDadosDeExemplo() {
  const storage = armazenamento();
  const chaves = [];
  for (let i = 0; i < storage.length; i++) {
    const chave = storage.key(i);
    if (chave.startsWith(PREFIXO)) chaves.push(chave);
  }
  for (const chave of chaves) storage.removeItem(chave);
  semente = null;
}
