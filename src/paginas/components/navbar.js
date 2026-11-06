import { encerrarSessao } from '../../shared/sessao.js';
import { ehAgente } from '../../pedidos-contratos/regras/permissoes.js';

export function montarNavbar(sessao) {
  const links = ehAgente(sessao.perfil)
    ? [['avaliacao.html', 'Pedidos'], ['clientes.html', 'Clientes']]
    : [['meus-pedidos.html', 'Meus pedidos'], ['clientes.html', 'Meus dados']];

  const nav = document.getElementById('navbar');
  nav.className = 'navbar navbar-expand navbar-dark bg-dark';
  nav.innerHTML = `
    <div class="container">
      <span class="navbar-brand">Aluguel de Carros</span>
      <ul class="navbar-nav me-auto"></ul>
      <span class="navbar-text me-3"></span>
      <button type="button" class="btn btn-outline-light btn-sm" id="sair">Sair</button>
    </div>`;

  const lista = nav.querySelector('ul');
  for (const [href, texto] of links) {
    const item = document.createElement('li');
    item.className = 'nav-item';
    const link = document.createElement('a');
    link.className = 'nav-link';
    link.href = href;
    link.textContent = texto;
    if (location.pathname.endsWith(href)) link.setAttribute('aria-current', 'page');
    item.append(link);
    lista.append(item);
  }
  nav.querySelector('.navbar-text').textContent = `${sessao.nome} (${sessao.perfil.toLowerCase()})`;
  nav.querySelector('#sair').addEventListener('click', () => {
    encerrarSessao();
    location.href = '/public/login.html';
  });
}
