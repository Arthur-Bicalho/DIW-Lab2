import { textoAlternativo } from './cartaoAutomovel.js';
import { urlSegura } from '../../pedidos-contratos/regras/automovel.js';

export function criarFotoAmpliada(elemento) {
  const modal = new bootstrap.Modal(elemento);
  const titulo = elemento.querySelector('.modal-title');
  const foto = elemento.querySelector('img');
  const legenda = elemento.querySelector('.legenda');
  const credito = elemento.querySelector('.credito');

  let origem = null;
  elemento.addEventListener('hidden.bs.modal', () => {
    const alvo = origem && document.contains(origem)
      ? origem
      : document.querySelector('h1, #resultados, main');
    if (alvo) {
      if (!alvo.matches('button, a, input, select, textarea, [tabindex]')) alvo.tabIndex = -1;
      alvo.focus();
    }
    origem = null;
  });

  return {
    abrir(automovel) {
      origem = document.activeElement;
      const { imagem } = automovel;
      titulo.textContent = `${automovel.marca} ${automovel.modelo} ${automovel.ano}`;
      foto.src = imagem.arquivo;
      foto.alt = textoAlternativo(automovel);
      legenda.textContent = imagem.legenda;

      const url = urlSegura(imagem.fonte);
      let fonte = 'Wikimedia Commons';
      if (url) {
        fonte = document.createElement('a');
        fonte.href = url;
        fonte.target = '_blank';
        fonte.rel = 'noopener noreferrer';
        fonte.textContent = 'Wikimedia Commons';
      }
      credito.replaceChildren(`Foto: ${imagem.autor}, licença ${imagem.licenca}. Fonte: `, fonte);
      modal.show();
    },
  };
}
