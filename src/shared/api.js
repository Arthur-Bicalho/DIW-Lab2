import { ErroApi } from './erro-api.js';
import { ARMAZENAMENTO } from './modo.js';
import { recursoLocal } from './armazenamento-local.js';

export { ErroApi };

export async function requisitar(caminho, { metodo = 'GET', corpo } = {}) {
  const opcoes = { method: metodo };
  if (corpo !== undefined) {
    opcoes.headers = { 'Content-Type': 'application/json' };
    opcoes.body = JSON.stringify(corpo);
  }

  let resposta;
  try {
    resposta = await fetch(caminho, opcoes);
  } catch {
    throw new ErroApi('Não foi possível conectar ao servidor. Verifique se a API está em execução.');
  }

  if (!resposta.ok) {
    throw new ErroApi(`Falha na requisição (${resposta.status}).`, resposta.status);
  }
  return resposta.status === 204 ? null : resposta.json();
}

export function recurso(nome) {
  if (ARMAZENAMENTO === 'local') return recursoLocal(nome);

  const raiz = `/${nome}`;
  return {
    // O JSON Server v1 compara filtros numéricos (?clienteId=1) com tipos estritos e
    // não encontra ids em texto; por isso o filtro é aplicado aqui (ADR 0007).
    async listar(filtros = {}) {
      const itens = await requisitar(raiz);
      return itens.filter((item) => Object.entries(filtros).every(([campo, valor]) => String(item[campo]) === String(valor)));
    },
    obter: (id) => requisitar(`${raiz}/${id}`),
    criar: (dados) => requisitar(raiz, { metodo: 'POST', corpo: dados }),
    atualizar: (id, dados) => requisitar(`${raiz}/${id}`, { metodo: 'PATCH', corpo: dados }),
    remover: (id) => requisitar(`${raiz}/${id}`, { metodo: 'DELETE' }),
  };
}
