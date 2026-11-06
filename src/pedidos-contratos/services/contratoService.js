import { recurso } from '../../shared/api.js';
import { STATUS_PEDIDO } from '../models/constantes.js';
import { ErroValidacao } from '../regras/erros.js';
import {
  agentePodeFirmarContrato, podeConcederCredito, proprietarioDoAutomovel, validarContrato, validarContratoCredito,
} from '../regras/contrato.js';

const contratos = recurso('contratos');
const pedidos = recurso('pedidos');
const automoveis = recurso('automoveis');

function montarContratoCredito(credito, agente) {
  if (!credito) return null;
  if (!podeConcederCredito(agente.perfil)) {
    throw new ErroValidacao({ geral: 'Somente um banco pode conceder Contrato de Crédito.' });
  }
  const erros = validarContratoCredito(credito);
  if (Object.keys(erros).length) throw new ErroValidacao(erros);
  return {
    bancoId: agente.id,
    valor: Number(credito.valor),
    parcelas: Number(credito.parcelas),
    taxaJurosMensal: Number(credito.taxaJurosMensal),
  };
}

export const contratoService = {
  listar: () => contratos.listar(),

  async firmar(pedidoId, agente, { tipoPropriedade, credito }, hoje) {
    const pedido = await pedidos.obter(pedidoId);
    if (!agentePodeFirmarContrato(pedido, agente.id)) {
      throw new ErroValidacao({ geral: 'Só o agente responsável pode firmar o contrato de um pedido aprovado.' });
    }
    if ((await contratos.listar({ pedidoId })).length > 0) {
      throw new ErroValidacao({ geral: 'Este pedido já possui contrato.' });
    }
    const erros = validarContrato({ tipoPropriedade }, agente);
    if (Object.keys(erros).length) throw new ErroValidacao(erros);
    const contratoCredito = montarContratoCredito(credito, agente);

    const contrato = await contratos.criar({
      pedidoId, agenteId: agente.id, tipoPropriedade, data: hoje, contratoCredito,
    });
    await pedidos.atualizar(pedidoId, { status: STATUS_PEDIDO.CONTRATADO });
    await automoveis.atualizar(pedido.automovelId, {
      proprietario: proprietarioDoAutomovel(tipoPropriedade, pedido, agente),
    });
    return contrato;
  },
};
