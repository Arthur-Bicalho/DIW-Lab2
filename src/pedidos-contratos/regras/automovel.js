import { CATEGORIAS_AUTOMOVEL, SEGMENTOS_AUTOMOVEL } from '../models/constantes.js';

const normalizar = (texto) => String(texto ?? '')
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .toLowerCase()
  .trim();

export function filtrarAutomoveis(lista, { modelo, ano, categoria, segmento, eletrico } = {}) {
  const busca = normalizar(modelo);
  return lista.filter((a) => (!busca || normalizar(`${a.marca} ${a.modelo}`).includes(busca))
    && (!ano || a.ano === Number(ano))
    && (!categoria || a.categoria === categoria)
    && (!segmento || a.segmento === segmento)
    && (!eletrico || a.eletrico === true));
}

export function anosDisponiveis(lista) {
  return [...new Set(lista.map((a) => a.ano))].sort((a, b) => b - a);
}

export function categoriasDisponiveis(lista) {
  const presentes = new Set(lista.map((a) => a.categoria));
  return Object.keys(CATEGORIAS_AUTOMOVEL).filter((c) => presentes.has(c));
}

export function paginar(lista, pagina, tamanho) {
  const totalPaginas = Math.max(1, Math.ceil(lista.length / tamanho));
  const pedida = Math.trunc(Number(pagina)) || 1;
  const atual = Math.min(Math.max(pedida, 1), totalPaginas);
  return {
    itens: lista.slice((atual - 1) * tamanho, atual * tamanho),
    pagina: atual,
    totalPaginas,
    total: lista.length,
  };
}

export const rotuloCategoria = (categoria) => CATEGORIAS_AUTOMOVEL[categoria] ?? categoria;
export const rotuloSegmento = (segmento) => SEGMENTOS_AUTOMOVEL[segmento] ?? segmento;

export function descricaoAutomovel(a) {
  const base = `${a.marca} ${a.modelo} ${a.ano} (${a.placa})`;
  const classificacao = [a.categoria && rotuloCategoria(a.categoria), a.segmento && rotuloSegmento(a.segmento)]
    .filter(Boolean);
  return classificacao.length ? `${base} - ${classificacao.join(', ')}` : base;
}

export function urlSegura(texto) {
  try {
    const url = new URL(texto);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}
