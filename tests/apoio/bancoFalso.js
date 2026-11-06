// Simula o JSON Server em memória para testar os serviços sem rede.
export function instalarBancoFalso(colecoes) {
  const banco = Object.fromEntries(colecoes.map((nome) => [nome, []]));

  globalThis.fetch = async (url, opcoes = {}) => {
    const caminho = url.slice(1);
    const [colecao, id] = caminho.split('/');
    const resposta = (dados) => ({ ok: true, status: 200, json: async () => dados });
    const metodo = opcoes.method ?? 'GET';

    if (metodo === 'POST') {
      const novo = { id: String(banco[colecao].length + 1), ...JSON.parse(opcoes.body) };
      banco[colecao].push(novo);
      return resposta(novo);
    }
    if (metodo === 'PATCH') {
      const item = banco[colecao].find((i) => i.id === id);
      Object.assign(item, JSON.parse(opcoes.body));
      return resposta(item);
    }
    if (metodo === 'DELETE') {
      banco[colecao] = banco[colecao].filter((i) => i.id !== id);
      return resposta({});
    }
    if (id) return resposta(banco[colecao].find((i) => i.id === id));
    return resposta(banco[colecao]);
  };

  return banco;
}
