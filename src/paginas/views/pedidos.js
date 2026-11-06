import { pedidoService } from '../../pedidos-contratos/services/pedidoService.js';
import { automovelService } from '../../pedidos-contratos/services/automovelService.js';
import { clientePodeCancelar, clientePodeModificar } from '../../pedidos-contratos/regras/pedido.js';
import { dataDeHoje, formatarData } from '../../pedidos-contratos/regras/formatacao.js';
import { mostrarAlerta } from '../../shared/alertas.js';
import { exigirAcesso } from '../components/guarda.js';
import { montarNavbar } from '../components/navbar.js';
import { limparErros, mensagemDoErro, tratarErroDoFormulario } from '../components/formulario.js';
import { criarSeloStatus } from '../components/statusPedido.js';

const sessao = exigirAcesso('pedidos');
montarNavbar(sessao);

const corpoTabela = document.getElementById('corpo-tabela');
const formulario = document.getElementById('form-pedido');
const tituloModal = document.getElementById('titulo-modal');
const seletorAutomovel = document.getElementById('automovelId');
const modal = new bootstrap.Modal(document.getElementById('modal-pedido'));
let automoveis = [];
let idEmEdicao = null;

const descricaoAutomovel = (a) => `${a.marca} ${a.modelo} ${a.ano} (${a.placa})`;

function celula(conteudo) {
  const td = document.createElement('td');
  td.append(conteudo);
  return td;
}

function botao(texto, classe, aoClicar) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = `btn btn-sm ${classe}`;
  el.textContent = texto;
  el.addEventListener('click', aoClicar);
  return el;
}

function textoDoParecer(parecer) {
  if (!parecer) return '-';
  return `${parecer.positivo ? 'Positivo' : 'Negativo'}: ${parecer.justificativa}`;
}

function linhaDoPedido(pedido) {
  const automovel = automoveis.find((a) => a.id === pedido.automovelId);
  const acoes = document.createElement('td');
  acoes.className = 'text-end text-nowrap';
  if (clientePodeModificar(pedido)) {
    acoes.append(botao('Modificar', 'btn-outline-primary me-1', () => abrirModal(pedido)));
  }
  if (clientePodeCancelar(pedido)) {
    acoes.append(botao('Cancelar', 'btn-outline-danger', () => cancelar(pedido)));
  }

  const tr = document.createElement('tr');
  tr.append(
    celula(automovel ? descricaoAutomovel(automovel) : 'Automóvel removido'),
    celula(`${formatarData(pedido.dataInicio)} a ${formatarData(pedido.dataFim)}`),
    celula(criarSeloStatus(pedido.status)),
    celula(textoDoParecer(pedido.parecer)),
    acoes,
  );
  return tr;
}

async function carregar() {
  try {
    const [pedidos, lista] = await Promise.all([
      pedidoService.listarDoCliente(sessao.id),
      automovelService.listar(),
    ]);
    automoveis = lista;
    corpoTabela.replaceChildren(...pedidos.map(linhaDoPedido));
    document.getElementById('sem-pedidos').hidden = pedidos.length > 0;
  } catch (erro) {
    mostrarAlerta(erro.message);
  }
}

function abrirModal(pedido = null) {
  idEmEdicao = pedido?.id ?? null;
  tituloModal.textContent = pedido ? 'Modificar pedido' : 'Novo pedido';
  limparErros(formulario);
  formulario.reset();
  seletorAutomovel.replaceChildren(
    ...automoveis.map((a) => new Option(descricaoAutomovel(a), a.id)),
  );
  seletorAutomovel.selectedIndex = -1;
  formulario.elements.dataInicio.min = dataDeHoje();
  if (pedido) {
    seletorAutomovel.value = pedido.automovelId;
    formulario.elements.dataInicio.value = pedido.dataInicio;
    formulario.elements.dataFim.value = pedido.dataFim;
  }
  modal.show();
}

async function cancelar(pedido) {
  if (!confirm('Cancelar este pedido?')) return;
  try {
    await pedidoService.cancelarDoCliente(pedido.id, sessao.id);
    mostrarAlerta('Pedido cancelado.', 'success');
    await carregar();
  } catch (erro) {
    mostrarAlerta(mensagemDoErro(erro));
  }
}

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  limparErros(formulario);
  const { automovelId, dataInicio, dataFim } = formulario.elements;
  const dados = { automovelId: automovelId.value, dataInicio: dataInicio.value, dataFim: dataFim.value };
  try {
    if (idEmEdicao) await pedidoService.modificarDoCliente(idEmEdicao, sessao.id, dados, dataDeHoje());
    else await pedidoService.criar(sessao.id, dados, dataDeHoje());
    modal.hide();
    mostrarAlerta('Pedido salvo com sucesso.', 'success');
    await carregar();
  } catch (erro) {
    tratarErroDoFormulario(formulario, erro);
  }
});

document.getElementById('novo-pedido').addEventListener('click', () => abrirModal());
carregar();
