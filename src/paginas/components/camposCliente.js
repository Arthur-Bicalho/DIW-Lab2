import { formatarCpf } from '../../pedidos-contratos/regras/formatacao.js';

const CAMPOS = [
  { nome: 'nome', rotulo: 'Nome', tipo: 'text', coluna: 12 },
  { nome: 'email', rotulo: 'E-mail', tipo: 'email', coluna: 6, extra: { autocomplete: 'email' } },
  { nome: 'senha', rotulo: 'Senha', tipo: 'password', coluna: 6, extra: { autocomplete: 'new-password' } },
  { nome: 'rg', rotulo: 'RG', tipo: 'text', coluna: 6 },
  { nome: 'cpf', rotulo: 'CPF', tipo: 'text', coluna: 6, extra: { inputmode: 'numeric', placeholder: '000.000.000-00' } },
  { nome: 'endereco', rotulo: 'Endereço', tipo: 'text', coluna: 12 },
  { nome: 'profissao', rotulo: 'Profissão', tipo: 'text', coluna: 12 },
];

const NOMES_CAMPOS_CLIENTE = CAMPOS.map((c) => c.nome);

function criarCampo({ nome, rotulo, tipo, coluna, extra = {} }) {
  const grupo = document.createElement('div');
  grupo.className = `col-md-${coluna}`;
  grupo.innerHTML = `
    <label class="form-label" for="${nome}">${rotulo}</label>
    <input class="form-control" id="${nome}" name="${nome}" type="${tipo}" required aria-required="true" aria-describedby="erro-${nome}">
    <div class="invalid-feedback" id="erro-${nome}"></div>`;
  const entrada = grupo.querySelector('input');
  for (const [atributo, valor] of Object.entries(extra)) entrada.setAttribute(atributo, valor);
  return grupo;
}

export function montarCamposCliente(container) {
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'col-12';
  fieldset.innerHTML = `
    <legend class="h6">Entidades empregadoras (máximo de 3)</legend>
    <div id="entidades"></div>
    <div class="invalid-feedback" id="erro-entidadesEmpregadoras"></div>
    <button type="button" class="btn btn-outline-secondary btn-sm" id="adicionar-entidade">Adicionar entidade</button>`;
  container.append(...CAMPOS.map(criarCampo), fieldset);
}

export function lerCamposCliente(formulario) {
  return Object.fromEntries(NOMES_CAMPOS_CLIENTE.map((nome) => [nome, formulario.elements[nome].value]));
}

export function preencherCamposCliente(formulario, cliente) {
  for (const nome of NOMES_CAMPOS_CLIENTE) {
    formulario.elements[nome].value = nome === 'senha' ? '' : cliente[nome];
  }
  formulario.elements.cpf.value = formatarCpf(cliente.cpf);
}
