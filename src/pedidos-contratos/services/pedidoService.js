import { recurso } from '../../shared/api.js';
import { STATUS_PEDIDO } from '../models/constantes.js';
import { ErroValidacao } from '../regras/erros.js';
import {
  agentePodeAvaliar, agentePodeIniciarAnalise, agentePodeModificar, automovelDisponivel,
  clientePodeCancelar, clientePodeModificar, validarParecer, validarPedido,
} from '../regras/pedido.js';

const pedidos = recurso('pedidos');

function recusar(mensagem) {
  throw new ErroValidacao({ geral: mensagem });
}

async function validar(dados, hoje, pedidoId = null) {
  const erros = validarPedido(dados, hoje);
  if (!erros.automovelId && !erros.dataInicio && !erros.dataFim) {
    const existentes = await pedidos.listar({ automovelId: dados.automovelId });
    if (!automovelDisponivel(dados.automovelId, existentes, pedidoId)) {
      erros.automovelId = 'Este automóvel já está em outro pedido em andamento.';
    }
  }
  if (Object.keys(erros).length) throw new ErroValidacao(erros);
}

async function obterDoCliente(id, clienteId) {
  const pedido = await pedidos.obter(id);
  if (pedido.clienteId !== clienteId) recusar('Este pedido pertence a outro cliente.');
  return pedido;
}

const camposDoPedido = ({ automovelId, dataInicio, dataFim }) => ({ automovelId, dataInicio, dataFim });

export const pedidoService = {
  listar: (filtros) => pedidos.listar(filtros),

  listarDoCliente: (clienteId) => pedidos.listar({ clienteId }),

  async criar(clienteId, dados, hoje) {
    await validar(dados, hoje);
    return pedidos.criar({
      ...camposDoPedido(dados),
      clienteId,
      status: STATUS_PEDIDO.PENDENTE,
      agenteId: null,
      parecer: null,
    });
  },

  async modificarDoCliente(id, clienteId, dados, hoje) {
    const pedido = await obterDoCliente(id, clienteId);
    if (!clientePodeModificar(pedido)) recusar('Só é possível modificar pedidos pendentes.');
    await validar(dados, hoje, id);
    return pedidos.atualizar(id, camposDoPedido(dados));
  },

  async cancelarDoCliente(id, clienteId) {
    const pedido = await obterDoCliente(id, clienteId);
    if (!clientePodeCancelar(pedido)) recusar('Este pedido não pode mais ser cancelado.');
    return pedidos.atualizar(id, { status: STATUS_PEDIDO.CANCELADO });
  },

  async iniciarAnalise(id, agenteId) {
    const pedido = await pedidos.obter(id);
    if (!agentePodeIniciarAnalise(pedido)) recusar('Só é possível analisar pedidos pendentes.');
    return pedidos.atualizar(id, { status: STATUS_PEDIDO.EM_ANALISE, agenteId });
  },

  async avaliar(id, agenteId, { positivo, justificativa }, hoje) {
    const pedido = await pedidos.obter(id);
    if (!agentePodeAvaliar(pedido, agenteId)) recusar('Só o agente responsável pode avaliar um pedido em análise.');
    const erros = validarParecer({ positivo, justificativa });
    if (Object.keys(erros).length) throw new ErroValidacao(erros);
    return pedidos.atualizar(id, {
      status: positivo ? STATUS_PEDIDO.APROVADO : STATUS_PEDIDO.REPROVADO,
      parecer: { positivo, justificativa: justificativa.trim(), data: hoje },
    });
  },

  async modificarComoAgente(id, dados, hoje) {
    const pedido = await pedidos.obter(id);
    if (!agentePodeModificar(pedido)) recusar('Só é possível modificar pedidos pendentes ou em análise.');
    await validar(dados, hoje, id);
    return pedidos.atualizar(id, camposDoPedido(dados));
  },
};
