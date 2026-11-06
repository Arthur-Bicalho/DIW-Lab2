import { STATUS_PEDIDO as S } from '../models/constantes.js';

const TRANSICOES = {
  [S.PENDENTE]: [S.EM_ANALISE, S.CANCELADO],
  [S.EM_ANALISE]: [S.APROVADO, S.REPROVADO, S.CANCELADO],
  [S.APROVADO]: [S.CONTRATADO, S.CANCELADO],
  [S.REPROVADO]: [],
  [S.CONTRATADO]: [],
  [S.CANCELADO]: [],
};

const STATUS_QUE_OCUPAM_AUTOMOVEL = [S.PENDENTE, S.EM_ANALISE, S.APROVADO, S.CONTRATADO];

export function podeTransitar(de, para) {
  return TRANSICOES[de]?.includes(para) ?? false;
}

export function clientePodeModificar(pedido) {
  return pedido.status === S.PENDENTE;
}

export function clientePodeCancelar(pedido) {
  return podeTransitar(pedido.status, S.CANCELADO);
}

export function agentePodeIniciarAnalise(pedido) {
  return podeTransitar(pedido.status, S.EM_ANALISE);
}

export function agentePodeAvaliar(pedido, agenteId) {
  return pedido.status === S.EM_ANALISE && pedido.agenteId === agenteId;
}

export function agentePodeModificar(pedido) {
  return pedido.status === S.PENDENTE || pedido.status === S.EM_ANALISE;
}

export function validarParecer({ positivo, justificativa }) {
  const erros = {};
  if (typeof positivo !== 'boolean') erros.positivo = 'Escolha aprovar ou reprovar.';
  if (!String(justificativa ?? '').trim()) erros.justificativa = 'Escreva a justificativa do parecer.';
  return erros;
}

// As datas são strings ISO (aaaa-mm-dd), que se comparam corretamente como texto.
export function validarPedido({ automovelId, dataInicio, dataFim }, hoje) {
  const erros = {};
  if (!automovelId) erros.automovelId = 'Escolha um automóvel.';
  if (!dataInicio) erros.dataInicio = 'Informe a data de início.';
  else if (dataInicio < hoje) erros.dataInicio = 'A data de início não pode estar no passado.';
  if (!dataFim) erros.dataFim = 'Informe a data de término.';
  else if (dataInicio && dataFim <= dataInicio) erros.dataFim = 'A data de término deve ser posterior à de início.';
  return erros;
}

export function automovelDisponivel(automovelId, pedidos, ignorarPedidoId = null) {
  return !pedidos.some((p) => p.automovelId === automovelId
    && p.id !== ignorarPedidoId
    && STATUS_QUE_OCUPAM_AUTOMOVEL.includes(p.status));
}
