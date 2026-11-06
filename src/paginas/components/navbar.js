import { encerrarSessao } from '../../shared/sessao.js';
import { ehAgente } from '../../pedidos-contratos/regras/permissoes.js';

export function montarNavbar(sessao) {
  const links = ehAgente(sessao.perfil)
    ? [['avaliacao.html', 'Pedidos'], ['clientes.html', 'Clientes']]
    : [['meus-pedidos.html', 'Meus pedidos'], ['catalogo.html', 'Catálogo'], ['clientes.html', 'Meus dados']];

  const nav = document.getElementById('navbar');
  nav.className = 'navbar navbar-expand-md navbar-dark bg-dark';
  nav.innerHTML = `
    <div class="container">
      <span class="navbar-brand">Aluguel de Carros</span>
      <button type="button" class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#menu-principal"
        aria-controls="menu-principal" aria-expanded="false" aria-label="Abrir menu">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="menu-principal">
        <ul class="navbar-nav me-auto"></ul>
        <span class="navbar-text me-md-3 py-2"></span>
        <div><button type="button" class="btn btn-outline-light btn-sm" id="sair">Sair</button></div>
      </div>
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
