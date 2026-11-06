import { rotuloCategoria, rotuloSegmento } from '../../pedidos-contratos/regras/automovel.js';

function criarSelo(texto, classe) {
  const selo = document.createElement('span');
  selo.className = `badge ${classe}`;
  selo.textContent = texto;
  return selo;
}

export function textoAlternativo(automovel) {
  return automovel.imagem?.legenda ?? `${automovel.marca} ${automovel.modelo} ${automovel.ano}`;
}

export function criarCartaoAutomovel(automovel, disponivel, aoVerFoto) {
  const coluna = document.createElement('div');
  coluna.className = 'col';
  coluna.innerHTML = `
    <article class="card h-100">
      <div class="ratio ratio-4x3"></div>
      <div class="card-body d-flex flex-column">
        <h2 class="card-title h5"></h2>
        <p class="card-text text-muted mb-2"></p>
        <div class="d-flex flex-wrap gap-1 mb-3 selos"></div>
        <div class="d-flex gap-2 mt-auto acoes"></div>
      </div>
    </article>`;

  const moldura = coluna.querySelector('.ratio');
  if (automovel.imagem) {
    const foto = document.createElement('img');
    foto.className = 'card-img-top object-fit-cover';
    foto.src = automovel.imagem.arquivo;
    foto.alt = textoAlternativo(automovel);
    foto.loading = 'lazy';
    moldura.append(foto);
  } else {
    moldura.classList.add('bg-light');
  }

  coluna.querySelector('.card-title').textContent = `${automovel.marca} ${automovel.modelo}`;
  coluna.querySelector('.card-text').textContent = String(automovel.ano);

  const selos = [
    [rotuloCategoria(automovel.categoria), 'text-bg-secondary'],
    [rotuloSegmento(automovel.segmento), automovel.segmento === 'LUXO' ? 'text-bg-dark' : 'text-bg-light border'],
  ];
  if (automovel.eletrico) selos.push(['Elétrico', 'text-bg-success']);
  selos.push(disponivel ? ['Disponível', 'text-bg-primary'] : ['Indisponível', 'text-bg-danger']);
  coluna.querySelector('.selos').append(...selos.map(([texto, classe]) => criarSelo(texto, classe)));

  const acoes = coluna.querySelector('.acoes');
  if (automovel.imagem) {
    const ver = document.createElement('button');
    ver.type = 'button';
    ver.className = 'btn btn-sm btn-outline-secondary';
    ver.textContent = 'Ver foto';
    ver.setAttribute('aria-label', `Ver foto ampliada de ${automovel.marca} ${automovel.modelo} ${automovel.ano}`);
    ver.addEventListener('click', () => aoVerFoto(automovel));
    acoes.append(ver);
  }

  const alugar = document.createElement(disponivel ? 'a' : 'button');
  alugar.className = 'btn btn-sm btn-primary';
  alugar.textContent = 'Alugar';
  if (disponivel) {
    alugar.href = `meus-pedidos.html?automovel=${encodeURIComponent(automovel.id)}`;
  } else {
    alugar.type = 'button';
    alugar.disabled = true;
  }
  alugar.setAttribute('aria-label', `Alugar ${automovel.marca} ${automovel.modelo} ${automovel.ano}`);
  acoes.append(alugar);
  return coluna;
}
