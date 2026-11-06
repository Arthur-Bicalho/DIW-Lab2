import { automovelService } from '../../pedidos-contratos/services/automovelService.js';
import { pedidoService } from '../../pedidos-contratos/services/pedidoService.js';
import { CATEGORIAS_AUTOMOVEL, ITENS_POR_PAGINA, SEGMENTOS_AUTOMOVEL } from '../../pedidos-contratos/models/constantes.js';
import {
  anosDisponiveis, categoriasDisponiveis, filtrarAutomoveis, paginar,
} from '../../pedidos-contratos/regras/automovel.js';
import { automovelDisponivel } from '../../pedidos-contratos/regras/pedido.js';
import { mostrarAlerta } from '../../shared/alertas.js';
import { exigirAcesso } from '../components/guarda.js';
import { montarNavbar } from '../components/navbar.js';
import { criarCartaoAutomovel } from '../components/cartaoAutomovel.js';
import { criarFotoAmpliada } from '../components/fotoAmpliada.js';
import { montarPaginacao } from '../components/paginacao.js';

const sessao = exigirAcesso('catalogo');
montarNavbar(sessao);

const formulario = document.getElementById('filtros');
const campos = {
  modelo: document.getElementById('filtro-modelo'),
  ano: document.getElementById('filtro-ano'),
  categoria: document.getElementById('filtro-categoria'),
  segmento: document.getElementById('filtro-segmento'),
  eletrico: document.getElementById('filtro-eletrico'),
};
const grade = document.getElementById('grade');
const contagem = document.getElementById('contagem');
const semResultados = document.getElementById('sem-resultados');
const navegacao = document.getElementById('paginacao');
const fotoAmpliada = criarFotoAmpliada(document.getElementById('modal-foto'));

let automoveis = [];
let pedidos = [];

function preencherSelect(select, textoTodos, opcoes) {
  select.replaceChildren(new Option(textoTodos, ''), ...opcoes.map(([valor, texto]) => new Option(texto, valor)));
}

function lerFiltros() {
  return {
    modelo: campos.modelo.value,
    ano: campos.ano.value,
    categoria: campos.categoria.value,
    segmento: campos.segmento.value,
    eletrico: campos.eletrico.checked,
  };
}

function exibir(numeroPagina = 1) {
  const filtrados = filtrarAutomoveis(automoveis, lerFiltros());
  const resultado = paginar(filtrados, numeroPagina, ITENS_POR_PAGINA);
  grade.replaceChildren(...resultado.itens.map((a) => criarCartaoAutomovel(
    a,
    automovelDisponivel(a.id, pedidos),
    fotoAmpliada.abrir,
  )));
  semResultados.hidden = resultado.total > 0;
  contagem.textContent = resultado.total === 1 ? '1 automóvel encontrado.' : `${resultado.total} automóveis encontrados.`;
  montarPaginacao(navegacao, resultado, (pagina) => {
    exibir(pagina);
    document.getElementById('filtros').scrollIntoView();
  });
}

async function carregar() {
  try {
    [automoveis, pedidos] = await Promise.all([automovelService.listar(), pedidoService.listar()]);
  } catch (erro) {
    mostrarAlerta(erro.message);
    return;
  }
  preencherSelect(campos.ano, 'Todos', anosDisponiveis(automoveis).map((a) => [a, a]));
  preencherSelect(campos.categoria, 'Todas',
    categoriasDisponiveis(automoveis).map((c) => [c, CATEGORIAS_AUTOMOVEL[c]]));
  preencherSelect(campos.segmento, 'Todos', Object.entries(SEGMENTOS_AUTOMOVEL));
  exibir();
}

formulario.addEventListener('input', () => exibir());
formulario.addEventListener('submit', (evento) => evento.preventDefault());
// O reset do navegador restaura os controles depois do evento; por isso a exibição espera.
formulario.addEventListener('reset', () => setTimeout(() => exibir()));
carregar();
