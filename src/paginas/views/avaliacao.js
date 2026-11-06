import { pedidoService } from '../../pedidos-contratos/services/pedidoService.js';
import { automovelService } from '../../pedidos-contratos/services/automovelService.js';
import { contratoService } from '../../pedidos-contratos/services/contratoService.js';
import { usuarioService } from '../../pedidos-contratos/services/usuarioService.js';
import { STATUS_PEDIDO } from '../../pedidos-contratos/models/constantes.js';
import { rendimentoTotal } from '../../pedidos-contratos/regras/cliente.js';
import {
  agentePodeAvaliar, agentePodeIniciarAnalise, agentePodeModificar,
} from '../../pedidos-contratos/regras/pedido.js';
import { agentePodeFirmarContrato, podeConcederCredito, tiposPropriedadePermitidos } from '../../pedidos-contratos/regras/contrato.js';
import { dataDeHoje, formatarData, formatarMoeda } from '../../pedidos-contratos/regras/formatacao.js';
import { mostrarAlerta } from '../../shared/alertas.js';
import { exigirAcesso } from '../components/guarda.js';
import { montarNavbar } from '../components/navbar.js';
import { limparErros, mensagemDoErro, tratarErroDoFormulario } from '../components/formulario.js';
import { criarSeloStatus, rotuloStatus } from '../components/statusPedido.js';
import { criarBotao, criarCelula } from '../components/tabela.js';
import {
  descricaoAutomovel, lerCamposPedido, montarCamposPedido, preencherCamposPedido,
} from '../components/camposPedido.js';

const sessao = exigirAcesso('avaliacao');
montarNavbar(sessao);

montarCamposPedido(document.getElementById('campos'));
const corpoTabela = document.getElementById('corpo-tabela');
const filtroStatus = document.getElementById('filtro-status');
const formPedido = document.getElementById('form-pedido');
const formAvaliacao = document.getElementById('form-avaliacao');
const modalPedido = new bootstrap.Modal(document.getElementById('modal-pedido'));
const formContrato = document.getElementById('form-contrato');
const modalContrato = new bootstrap.Modal(document.getElementById('modal-contrato'));
const modalAvaliacao = new bootstrap.Modal(document.getElementById('modal-avaliacao'));
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
    acoes.append(criarBotao('Firmar contrato', 'btn-primary me-1', () => abrirContrato(pedido)));
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
  if (!cliente) {
    mostrarAlerta('Cliente deste pedido não encontrado.');
    return;
  }
  pedidoEmEdicao = pedido;
  limparErros(formAvaliacao);
  formAvaliacao.reset();
  document.getElementById('resumo-cliente').textContent = `${cliente.nome}, ${cliente.profissao}`;
  document.getElementById('lista-rendimentos').replaceChildren(
    ...cliente.entidadesEmpregadoras.map((e) => {
      const item = document.createElement('li');
      item.textContent = `${e.nome}: ${formatarMoeda(e.rendimento)}`;
      return item;
    }),
  );
  document.getElementById('total-rendimentos').textContent = `Rendimento total: ${formatarMoeda(rendimentoTotal(cliente.entidadesEmpregadoras))}`;
  modalAvaliacao.show();
}

function abrirContrato(pedido) {
  pedidoEmEdicao = pedido;
  limparErros(formContrato);
  formContrato.reset();
  formContrato.elements.tipoPropriedade.replaceChildren(
    ...tiposPropriedadePermitidos(sessao.perfil).map((tipo) => new Option(`Propriedade de ${tipo.toLowerCase()}`, tipo)),
  );
  formContrato.elements.tipoPropriedade.selectedIndex = -1;
  document.getElementById('area-credito').hidden = !podeConcederCredito(sessao.perfil);
  document.getElementById('campos-credito').hidden = true;
  modalContrato.show();
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

formAvaliacao.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  limparErros(formAvaliacao);
  const escolha = formAvaliacao.elements.positivo.value;
  const parecer = {
    positivo: escolha === '' ? undefined : escolha === 'true',
    justificativa: formAvaliacao.elements.justificativa.value,
  };
  try {
    const avaliado = await pedidoService.avaliar(pedidoEmEdicao.id, sessao.id, parecer, dataDeHoje());
    modalAvaliacao.hide();
    mostrarAlerta(`Pedido ${avaliado.status === STATUS_PEDIDO.APROVADO ? 'aprovado e disponível para contrato' : 'reprovado'}.`, 'success');
    await carregar();
  } catch (erro) {
    tratarErroDoFormulario(formAvaliacao, erro);
  }
});

formContrato.elements.comCredito.addEventListener('change', (evento) => {
  document.getElementById('campos-credito').hidden = !evento.target.checked;
});

formContrato.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  limparErros(formContrato);
  const { tipoPropriedade, comCredito, valor, parcelas, taxaJurosMensal } = formContrato.elements;
  const dados = {
    tipoPropriedade: tipoPropriedade.value,
    credito: comCredito.checked
      ? { valor: valor.value, parcelas: parcelas.value, taxaJurosMensal: taxaJurosMensal.value }
      : null,
  };
  try {
    await contratoService.firmar(pedidoEmEdicao.id, sessao, dados, dataDeHoje());
    modalContrato.hide();
    mostrarAlerta('Contrato firmado.', 'success');
    await carregar();
  } catch (erro) {
    tratarErroDoFormulario(formContrato, erro);
  }
});

filtroStatus.addEventListener('change', carregar);
carregar();
