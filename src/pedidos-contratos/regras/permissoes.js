import { PERFIS } from '../models/constantes.js';

const PAGINAS_POR_PERFIL = {
  clientes: [PERFIS.CLIENTE, PERFIS.EMPRESA, PERFIS.BANCO],
  pedidos: [PERFIS.CLIENTE],
  catalogo: [PERFIS.CLIENTE],
  avaliacao: [PERFIS.EMPRESA, PERFIS.BANCO],
};

export function ehAgente(perfil) {
  return perfil === PERFIS.EMPRESA || perfil === PERFIS.BANCO;
}

export function ehCliente(perfil) {
  return perfil === PERFIS.CLIENTE;
}

export function podeAcessarPagina(perfil, pagina) {
  return PAGINAS_POR_PERFIL[pagina]?.includes(perfil) ?? false;
}

export function paginaInicial(perfil) {
  return ehAgente(perfil) ? 'avaliacao.html' : 'meus-pedidos.html';
}

export function podeGerenciarCliente(sessao, clienteId) {
  return ehCliente(sessao.perfil) && sessao.id === clienteId;
}
