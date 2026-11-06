import { clienteService } from '../../pedidos-contratos/services/clienteService.js';
import { ErroValidacao, rendimentoTotal } from '../../pedidos-contratos/regras/validacoes.js';
import { formatarCpf, formatarMoeda } from '../../pedidos-contratos/regras/formatacao.js';
import { mostrarAlerta } from '../../shared/alertas.js';
import { limparErros, mostrarErros } from '../components/formulario.js';
import { iniciarEntidadesEmpregadoras } from '../components/entidadesEmpregadoras.js';

const CAMPOS = ['nome', 'email', 'senha', 'rg', 'cpf', 'endereco', 'profissao'];

const corpoTabela = document.getElementById('corpo-tabela');
const formulario = document.getElementById('form-cliente');
const tituloModal = document.getElementById('titulo-modal');
const modal = new bootstrap.Modal(document.getElementById('modal-cliente'));
const entidades = iniciarEntidadesEmpregadoras(
  document.getElementById('entidades'),
  document.getElementById('adicionar-entidade'),
);
let idEmEdicao = null;

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
  acoes.append(
    botao('Editar', 'btn-outline-primary me-1', () => abrirEdicao(cliente.id)),
    botao('Excluir', 'btn-outline-danger', () => excluir(cliente)),
  );
  tr.append(acoes);
  return tr;
}

async function carregar() {
  try {
    const clientes = await clienteService.listar();
    corpoTabela.replaceChildren(...clientes.map(linhaDoCliente));
    document.getElementById('sem-clientes').hidden = clientes.length > 0;
  } catch (erro) {
    mostrarAlerta(erro.message);
  }
}

function abrirNovo() {
  idEmEdicao = null;
  tituloModal.textContent = 'Novo cliente';
  formulario.reset();
  limparErros(formulario);
  entidades.preencher([]);
  formulario.elements.senha.required = true;
  modal.show();
}

async function abrirEdicao(id) {
  try {
    const cliente = await clienteService.obter(id);
    idEmEdicao = id;
    tituloModal.textContent = 'Editar cliente';
    formulario.reset();
    limparErros(formulario);
    CAMPOS.forEach((campo) => {
      formulario.elements[campo].value = campo === 'senha' ? '' : cliente[campo];
    });
    formulario.elements.cpf.value = formatarCpf(cliente.cpf);
    formulario.elements.senha.required = false;
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
    mostrarAlerta('Cliente excluído.', 'success');
    await carregar();
  } catch (erro) {
    mostrarAlerta(erro instanceof ErroValidacao ? Object.values(erro.erros)[0] : erro.message);
  }
}

async function salvar(evento) {
  evento.preventDefault();
  limparErros(formulario);
  const dados = Object.fromEntries(CAMPOS.map((campo) => [campo, formulario.elements[campo].value]));
  dados.entidadesEmpregadoras = entidades.ler();

  try {
    if (idEmEdicao) await clienteService.atualizar(idEmEdicao, dados);
    else await clienteService.criar(dados);
    modal.hide();
    mostrarAlerta('Cliente salvo com sucesso.', 'success');
    await carregar();
  } catch (erro) {
    if (erro instanceof ErroValidacao) mostrarErros(formulario, erro.erros);
    else mostrarAlerta(erro.message);
  }
}

document.getElementById('novo-cliente').addEventListener('click', abrirNovo);
formulario.addEventListener('submit', salvar);
carregar();
