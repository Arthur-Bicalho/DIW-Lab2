import { MAX_ENTIDADES_EMPREGADORAS } from '../models/constantes.js';
import { somenteDigitos } from './formatacao.js';

function digitoVerificador(digitos, pesoInicial) {
  const soma = digitos.reduce((total, d, i) => total + d * (pesoInicial - i), 0);
  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
}

export function validarCpf(cpf) {
  const texto = somenteDigitos(cpf);
  if (texto.length !== 11 || /^(\d)\1{10}$/.test(texto)) return false;

  const digitos = [...texto].map(Number);
  return digitoVerificador(digitos.slice(0, 9), 10) === digitos[9]
    && digitoVerificador(digitos.slice(0, 10), 11) === digitos[10];
}

export function rendimentoTotal(entidades) {
  return entidades.reduce((total, e) => total + Number(e.rendimento), 0);
}

function vazio(valor) {
  return !String(valor ?? '').trim();
}

function validarEntidades(entidades) {
  if (entidades.length > MAX_ENTIDADES_EMPREGADORAS) {
    return `Informe no máximo ${MAX_ENTIDADES_EMPREGADORAS} entidades empregadoras.`;
  }
  const incompleta = entidades.some((e) => vazio(e.nome) || !(Number(e.rendimento) > 0));
  return incompleta ? 'Cada entidade empregadora precisa de nome e rendimento maior que zero.' : null;
}

export function validarCliente(dados, { edicao = false } = {}) {
  const erros = {};
  const obrigatorios = {
    nome: 'Informe o nome.',
    rg: 'Informe o RG.',
    endereco: 'Informe o endereço.',
    profissao: 'Informe a profissão.',
  };
  for (const [campo, mensagem] of Object.entries(obrigatorios)) {
    if (vazio(dados[campo])) erros[campo] = mensagem;
  }

  if (vazio(dados.cpf)) erros.cpf = 'Informe o CPF.';
  else if (!validarCpf(dados.cpf)) erros.cpf = 'CPF inválido.';

  if (vazio(dados.email)) erros.email = 'Informe o e-mail.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) erros.email = 'E-mail inválido.';

  if (!edicao && vazio(dados.senha)) erros.senha = 'Informe a senha.';
  else if (!vazio(dados.senha) && dados.senha.length < 6) erros.senha = 'A senha deve ter ao menos 6 caracteres.';

  const erroEntidades = validarEntidades(dados.entidadesEmpregadoras ?? []);
  if (erroEntidades) erros.entidadesEmpregadoras = erroEntidades;

  return erros;
}
