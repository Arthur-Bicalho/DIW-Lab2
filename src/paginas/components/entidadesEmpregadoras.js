import { MAX_ENTIDADES_EMPREGADORAS } from '../../pedidos-contratos/models/constantes.js';

function criarLinha(indice, entidade) {
  const linha = document.createElement('div');
  linha.className = 'row g-2 mb-2 entidade';
  linha.innerHTML = `
    <div class="col-md-6">
      <label class="form-label" for="entidade-nome-${indice}">Entidade empregadora</label>
      <input class="form-control entidade-nome" id="entidade-nome-${indice}" type="text" aria-describedby="erro-entidadesEmpregadoras">
    </div>
    <div class="col-8 col-md-4">
      <label class="form-label" for="entidade-rendimento-${indice}">Rendimento (R$)</label>
      <input class="form-control entidade-rendimento" id="entidade-rendimento-${indice}" type="number" min="0" step="0.01" aria-describedby="erro-entidadesEmpregadoras">
    </div>
    <div class="col-4 col-md-2 d-flex align-items-end">
      <button type="button" class="btn btn-outline-danger w-100 remover-entidade">Remover</button>
    </div>`;
  linha.querySelector('.entidade-nome').value = entidade.nome ?? '';
  linha.querySelector('.entidade-rendimento').value = entidade.rendimento ?? '';
  return linha;
}

export function iniciarEntidadesEmpregadoras(container, botaoAdicionar) {
  let contador = 0;

  const atualizarBotao = () => {
    botaoAdicionar.hidden = container.children.length >= MAX_ENTIDADES_EMPREGADORAS;
  };

  const adicionar = (entidade = {}) => {
    if (container.children.length >= MAX_ENTIDADES_EMPREGADORAS) return;
    container.append(criarLinha(contador++, entidade));
    atualizarBotao();
  };

  botaoAdicionar.addEventListener('click', () => adicionar());
  container.addEventListener('click', (evento) => {
    if (!evento.target.classList.contains('remover-entidade')) return;
    evento.target.closest('.entidade').remove();
    atualizarBotao();
  });

  return {
    preencher(entidades) {
      container.replaceChildren();
      entidades.forEach((e) => adicionar(e));
      atualizarBotao();
    },
    ler() {
      return [...container.querySelectorAll('.entidade')].map((linha) => ({
        nome: linha.querySelector('.entidade-nome').value,
        rendimento: linha.querySelector('.entidade-rendimento').value,
      }));
    },
  };
}
