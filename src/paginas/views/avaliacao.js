import { pedidoService } from '../../pedidos-contratos/services/pedidoService.js';
import { STATUS_PEDIDO } from '../../pedidos-contratos/models/constantes.js';
import { automovelService } from '../../pedidos-contratos/services/automovelService.js';
import { usuarioService } from '../../pedidos-contratos/services/usuarioService.js';
import {
  agentePodeAvaliar, agentePodeIniciarAnalise, agentePodeModificar,
} from '../../pedidos-contratos/regras/pedido.js';
import { agentePodeFirmarContrato } from '../../pedidos-contratos/regras/contrato.js';
import { descricaoAutomovel } from '../../pedidos-contratos/regras/automovel.js';
import { dataDeHoje, formatarData } from '../../pedidos-contratos/regras/formatacao.js';
import { mostrarAlerta } from '../../shared/alertas.js';
import { exigirAcesso } from '../components/guarda.js';
import { montarNavbar } from '../components/navbar.js';
import { limparErros, mensagemDoErro, tratarErroDoFormulario } from '../components/formulario.js';
import { criarDialogoAvaliacao } from '../components/dialogoAvaliacao.js';
import { criarDialogoContrato } from '../components/dialogoContrato.js';
import { criarSeloStatus, rotuloStatus } from '../components/statusPedido.js';
import { criarBotao, criarCelula } from '../components/tabela.js';
import {
  lerCamposPedido, montarCamposPedido, preencherCamposPedido,
} from '../components/camposPedido.js';

const sessao = exigirAcesso('avaliacao');
montarNavbar(sessao);

montarCamposPedido(document.getElementById('campos'));
const corpoTabela = document.getElementById('corpo-tabela');
const filtroStatus = document.getElementById('filtro-status');
const formPedido = document.getElementById('form-pedido');
const modalPedido = new bootstrap.Modal(document.getElementById('modal-pedido'));
const dialogoAvaliacao = criarDialogoAvaliacao({ sessao, aoConcluir: carregar });
const dialogoContrato = criarDialogoContrato({ sessao, aoConcluir: carregar });
let automoveis = [];
let usuarios = [];
let pedidoEmEdicao = null;

Object.values(STATUS_PEDIDO).forEach((status) => filtroStatus.append(new Option(rotuloStatus(status), status)));

const nomeDe = (id) => usuarios.find((u) => u.id === id)?.nome ?? '-';

function linhaDoPedido(pedido) {
  const automovel = automoveis.find((a) => a.id === pedido.automovelId);
  const acoes = document.createElement('td');
  acoes.className = 'text-end text-nowrap';
  if (agentePodeIniciarAnalise(pedido)) {
    acoes.append(criarBotao('Iniciar análise', 'btn-outline-success me-1', () => iniciarAnalise(pedido)));
  }
  if (agentePodeAvaliar(pedido, sessao.id)) {
    acoes.append(criarBotao('Avaliar', 'btn-success me-1', () => abrirAvaliacao(pedido)));
  }
  if (agentePodeFirmarContrato(pedido, sessao.id)) {
    acoes.append(criarBotao('Firmar contrato', 'btn-primary me-1', () => dialogoContrato.abrir(pedido)));
  }
  if (agentePodeModificar(pedido)) {
    acoes.append(criarBotao('Modificar', 'btn-outline-primary', () => abrirModificacao(pedido)));
  }

  const tr = document.createElement('tr');
  tr.append(
    criarCelula(nomeDe(pedido.clienteId)),
    criarCelula(automovel ? descricaoAutomovel(automovel) : 'Automóvel removido'),
    criarCelula(`${formatarData(pedido.dataInicio)} a ${formatarData(pedido.dataFim)}`),
    criarCelula(criarSeloStatus(pedido.status)),
    criarCelula(pedido.agenteId ? nomeDe(pedido.agenteId) : '-'),
    acoes,
  );
  return tr;
}

async function carregar() {
  try {
    const filtros = filtroStatus.value ? { status: filtroStatus.value } : {};
    const [pedidos, listaAutomoveis, listaUsuarios] = await Promise.all([
      pedidoService.listar(filtros),
      automovelService.listar(),
      usuarioService.listar(),
    ]);
    automoveis = listaAutomoveis;
    usuarios = listaUsuarios;
    corpoTabela.replaceChildren(...pedidos.map(linhaDoPedido));
    document.getElementById('sem-pedidos').hidden = pedidos.length > 0;
  } catch (erro) {
    mostrarAlerta(erro.message);
  }
}

async function iniciarAnalise(pedido) {
  try {
    await pedidoService.iniciarAnalise(pedido.id, sessao.id);
    mostrarAlerta('Pedido em análise. Emita o parecer quando concluir.', 'success');
    await carregar();
  } catch (erro) {
    mostrarAlerta(mensagemDoErro(erro));
  }
}

function abrirModificacao(pedido) {
  pedidoEmEdicao = pedido;
  limparErros(formPedido);
  formPedido.reset();
  preencherCamposPedido(formPedido, automoveis, pedido, dataDeHoje());
  modalPedido.show();
}

function abrirAvaliacao(pedido) {
  const cliente = usuarios.find((u) => u.id === pedido.clienteId);
  if (cliente) dialogoAvaliacao.abrir(pedido, cliente);
  else mostrarAlerta('Cliente deste pedido não encontrado.');
}

formPedido.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  limparErros(formPedido);
  try {
    await pedidoService.modificarComoAgente(pedidoEmEdicao.id, lerCamposPedido(formPedido), dataDeHoje());
    modalPedido.hide();
    mostrarAlerta('Pedido modificado.', 'success');
    await carregar();
  } catch (erro) {
    tratarErroDoFormulario(formPedido, erro);
  }
});

filtroStatus.addEventListener('change', carregar);
carregar();
