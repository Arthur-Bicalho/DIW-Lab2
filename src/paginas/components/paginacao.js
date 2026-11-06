function criarItem(texto, pagina, { ativo = false, desabilitado = false, rotulo } = {}) {
  const item = document.createElement('li');
  item.className = `page-item${ativo ? ' active' : ''}${desabilitado ? ' disabled' : ''}`;
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'page-link';
  botao.textContent = texto;
  botao.dataset.pagina = pagina;
  if (rotulo) botao.setAttribute('aria-label', rotulo);
  if (ativo) botao.setAttribute('aria-current', 'page');
  if (desabilitado) botao.disabled = true;
  item.append(botao);
  return item;
}

// Quando há uma só página, a navegação some.
export function montarPaginacao(nav, { pagina, totalPaginas }, aoMudar) {
  nav.replaceChildren();
  nav.hidden = totalPaginas <= 1;
  if (totalPaginas <= 1) return;

  const lista = document.createElement('ul');
  lista.className = 'pagination justify-content-center flex-wrap';
  lista.append(criarItem('Anterior', pagina - 1, { desabilitado: pagina === 1 }));
  for (let n = 1; n <= totalPaginas; n += 1) {
    lista.append(criarItem(String(n), n, { ativo: n === pagina, rotulo: `Página ${n}` }));
  }
  lista.append(criarItem('Próxima', pagina + 1, { desabilitado: pagina === totalPaginas }));
  lista.addEventListener('click', (evento) => {
    const botao = evento.target.closest('button[data-pagina]');
    if (botao && !botao.disabled) aoMudar(Number(botao.dataset.pagina));
  });
  nav.append(lista);
}
