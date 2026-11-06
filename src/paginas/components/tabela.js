export function criarCelula(conteudo) {
  const td = document.createElement('td');
  td.append(conteudo);
  return td;
}

export function criarBotao(texto, classe, aoClicar) {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = `btn btn-sm ${classe}`;
  botao.textContent = texto;
  botao.addEventListener('click', aoClicar);
  return botao;
}
