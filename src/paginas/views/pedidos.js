import { pedidoService } from '../../pedidos-contratos/services/pedidoService.js';
import { contratoService } from '../../pedidos-contratos/services/contratoService.js';
import { automovelService } from '../../pedidos-contratos/services/automovelService.js';
import { clientePodeCancelar, clientePodeModificar } from '../../pedidos-contratos/regras/pedido.js';
import { descreverContrato } from '../../pedidos-contratos/regras/contrato.js';
import { dataDeHoje, formatarData } from '../../pedidos-contratos/regras/formatacao.js';
import { mostrarAlerta } from '../../shared/alertas.js';
import { criarBotao, criarCelula } from '../components/tabela.js';
import { exigirAcesso } from '../components/guarda.js';
import { montarNavbar } from '../components/navbar.js';
import { limparErros, mensagemDoErro, tratarErroDoFormulario } from '../components/formulario.js';
import { criarSeloStatus } from '../components/statusPedido.js';
import {
  descricaoAutomovel, lerCamposPedido, montarCamposPedido, preencherCamposPedido,
} from '../components/camposPedido.js';

const sessao = exigirAcesso('pedidos');
montarNavbar(sessao);

montarCamposPedido(document.getElementById('campos'));
const corpoTabela = document.getElementById('corpo-tabela');
const formulario = document.getElementById('form-pedido');
const tituloModal = document.getElementById('titulo-modal');
const modal = new bootstrap.Modal(document.getElementById('modal-pedido'));
let automoveis = [];
let contratos = [];
let idEmEdicao = null;

function textoDoParecer(parecer) {
  if (!parecer) return '-';
  return `${parecer.positivo ? 'Positivo' : 'Negativo'}: ${parecer.justificativa}`;
}

function linhaDoPedido(pedido) {
  const automovel = automoveis.find((a) => a.id === pedido.automovelId);
  const contrato = contratos.find((c) => c.pedidoId === pedido.id);
  const acoes = document.createElement('td');
  acoes.className = 'text-end text-nowrap';
  if (clientePodeModificar(pedido)) {
    acoes.append(criarBotao('Modificar', 'btn-outline-primary me-1', () => abrirModal(pedido)));
  }
  if (clientePodeCancelar(pedido)) {
    acoes.append(criarBotao('Cancelar', 'btn-outline-danger', () => cancelar(pedido)));
  }

  const tr = document.createElement('tr');
  tr.append(
    criarCelula(automovel ? descricaoAutomovel(automovel) : 'Automóvel removido'),
    criarCelula(`${formatarData(pedido.dataInicio)} a ${formatarData(pedido.dataFim)}`),
    criarCelula(criarSeloStatus(pedido.status)),
    criarCelula(textoDoParecer(pedido.parecer)),
    criarCelula(contrato ? descreverContrato(contrato) : '-'),
    acoes,
  );
  return tr;
}

async function carregar() {
  try {
    const [pedidos, listaAutomoveis, listaContratos] = await Promise.all([
      pedidoService.listarDoCliente(sessao.id),
      automovelService.listar(),
      contratoService.listar(),
    ]);
    automoveis = listaAutomoveis;
    contratos = listaContratos;
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
  preencherCamposPedido(formulario, automoveis, pedido, dataDeHoje());
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
  const dados = lerCamposPedido(formulario);
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
