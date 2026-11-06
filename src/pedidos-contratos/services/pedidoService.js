import { recurso } from '../../shared/api.js';
import { STATUS_PEDIDO } from '../models/constantes.js';
import { ErroValidacao } from '../regras/erros.js';
import {
  automovelDisponivel, clientePodeCancelar, clientePodeModificar, validarPedido,
} from '../regras/pedido.js';

const pedidos = recurso('pedidos');

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
  if (pedido.clienteId !== clienteId) {
    throw new ErroValidacao({ geral: 'Este pedido pertence a outro cliente.' });
  }
  return pedido;
}

const camposDoPedido = ({ automovelId, dataInicio, dataFim }) => ({ automovelId, dataInicio, dataFim });

export const pedidoService = {
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
    if (!clientePodeModificar(pedido)) {
      throw new ErroValidacao({ geral: 'Só é possível modificar pedidos pendentes.' });
    }
    await validar(dados, hoje, id);
    return pedidos.atualizar(id, camposDoPedido(dados));
  },

  async cancelarDoCliente(id, clienteId) {
    const pedido = await obterDoCliente(id, clienteId);
    if (!clientePodeCancelar(pedido)) {
      throw new ErroValidacao({ geral: 'Este pedido não pode mais ser cancelado.' });
    }
    return pedidos.atualizar(id, { status: STATUS_PEDIDO.CANCELADO });
  },
};
