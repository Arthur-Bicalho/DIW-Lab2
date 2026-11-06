// Parâmetros nomeados dos rewrites do vercel.json (`:recurso` e `:resto`).
// A Vercel os anexa à query string da URL entregue à Function, e o JSON Server
// os trataria como filtros (`/pedidos?recurso=pedidos` filtra por um campo
// "recurso" inexistente e devolve []).
export const PARAMS_DOS_REWRITES = ['recurso', 'resto'];

// Devolve a URL original da requisição, sem os parâmetros injetados pelos rewrites.
export function restaurarUrl(url) {
  const [caminho, ...resto] = url.split('?');
  const consulta = new URLSearchParams(resto.join('?'));
  for (const nome of PARAMS_DOS_REWRITES) consulta.delete(nome);
  const texto = consulta.toString();
  return texto ? `${caminho}?${texto}` : caminho;
}
