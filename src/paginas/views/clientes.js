import { clienteService } from '../../pedidos-contratos/services/clienteService.js';
import { rendimentoTotal } from '../../pedidos-contratos/regras/cliente.js';
import { formatarCpf, formatarMoeda } from '../../pedidos-contratos/regras/formatacao.js';
import { mostrarAlerta } from '../../shared/alertas.js';
import { ehCliente, podeGerenciarCliente } from '../../pedidos-contratos/regras/permissoes.js';
import { encerrarSessao } from '../../shared/sessao.js';
import { exigirAcesso } from '../components/guarda.js';
import { montarNavbar } from '../components/navbar.js';
import { limparErros, mensagemDoErro, tratarErroDoFormulario } from '../components/formulario.js';
import { lerCamposCliente, montarCamposCliente, preencherCamposCliente } from '../components/camposCliente.js';
import { iniciarEntidadesEmpregadoras } from '../components/entidadesEmpregadoras.js';

const sessao = exigirAcesso('clientes');
montarNavbar(sessao);

montarCamposCliente(document.getElementById('campos'));
const corpoTabela = document.getElementById('corpo-tabela');
const formulario = document.getElementById('form-cliente');
const modal = new bootstrap.Modal(document.getElementById('modal-cliente'));
const entidades = iniciarEntidadesEmpregadoras(
  document.getElementById('entidades'),
  document.getElementById('adicionar-entidade'),
);
let idEmEdicao = null;
const clienteLogado = ehCliente(sessao.perfil);
if (clienteLogado) document.getElementById('titulo-pagina').textContent = 'Meus dados';

function celula(texto) {
  const td = document.createElement('td');
  td.textContent = texto;
  return td;
}

function botao(texto, classe, aoClicar) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `btn btn-sm ${classe}`;
  b.textContent = texto;
  b.addEventListener('click', aoClicar);
  return b;
}

function linhaDoCliente(cliente) {
  const tr = document.createElement('tr');
  tr.append(celula(cliente.nome), celula(formatarCpf(cliente.cpf)), celula(cliente.profissao), celula(formatarMoeda(rendimentoTotal(cliente.entidadesEmpregadoras))));

  const acoes = document.createElement('td');
  acoes.className = 'text-end text-nowrap';
  if (podeGerenciarCliente(sessao, cliente.id)) {
    acoes.append(
      botao('Editar', 'btn-outline-primary me-1', () => abrirEdicao(cliente.id)),
      botao('Excluir', 'btn-outline-danger', () => excluir(cliente)),
    );
  }
  tr.append(acoes);
  return tr;
}

async function carregar() {
  try {
    const clientes = clienteLogado ? [await clienteService.obter(sessao.id)] : await clienteService.listar();
    corpoTabela.replaceChildren(...clientes.map(linhaDoCliente));
    document.getElementById('sem-clientes').hidden = clientes.length > 0;
  } catch (erro) {
    mostrarAlerta(erro.message);
  }
}

async function abrirEdicao(id) {
  try {
    const cliente = await clienteService.obter(id);
    idEmEdicao = id;
    formulario.reset();
    limparErros(formulario);
    preencherCamposCliente(formulario, cliente);
    entidades.preencher(cliente.entidadesEmpregadoras);
    modal.show();
  } catch (erro) {
    mostrarAlerta(erro.message);
  }
}

async function excluir(cliente) {
  if (!confirm(`Excluir o cliente ${cliente.nome}?`)) return;
  try {
    await clienteService.remover(cliente.id);
    encerrarSessao();
    location.href = '/public/login.html';
  } catch (erro) {
    mostrarAlerta(mensagemDoErro(erro));
  }
}

async function salvar(evento) {
  evento.preventDefault();
  limparErros(formulario);
  const dados = { ...lerCamposCliente(formulario), entidadesEmpregadoras: entidades.ler() };

  try {
    await clienteService.atualizar(idEmEdicao, dados);
    modal.hide();
    mostrarAlerta('Cliente salvo com sucesso.', 'success');
    await carregar();
  } catch (erro) {
    tratarErroDoFormulario(formulario, erro);
  }
}

formulario.addEventListener('submit', salvar);
carregar();
