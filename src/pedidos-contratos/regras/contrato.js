import { PERFIS, STATUS_PEDIDO, TIPOS_PROPRIEDADE } from '../models/constantes.js';
import { formatarMoeda } from './formatacao.js';

export function agentePodeFirmarContrato(pedido, agenteId) {
  return pedido.status === STATUS_PEDIDO.APROVADO && pedido.agenteId === agenteId;
}

export function podeConcederCredito(perfil) {
  return perfil === PERFIS.BANCO;
}

export function tiposPropriedadePermitidos(perfilDoAgente) {
  return [TIPOS_PROPRIEDADE.CLIENTE, perfilDoAgente];
}

// Empresa e Banco só podem ser Proprietários quando é o próprio Agente que firma (ADR 0003).
export function validarContrato({ tipoPropriedade }, agente) {
  const erros = {};
  if (!Object.values(TIPOS_PROPRIEDADE).includes(tipoPropriedade)) {
    erros.tipoPropriedade = 'Escolha o tipo de propriedade do automóvel.';
  } else if (!tiposPropriedadePermitidos(agente.perfil).includes(tipoPropriedade)) {
    erros.tipoPropriedade = `Este agente não pode registrar o automóvel como propriedade de ${tipoPropriedade.toLowerCase()}.`;
  }
  return erros;
}

export function validarContratoCredito({ valor, parcelas, taxaJurosMensal }) {
  const erros = {};
  if (!(Number(valor) > 0)) erros.valor = 'Informe um valor maior que zero.';
  if (!Number.isInteger(Number(parcelas)) || Number(parcelas) < 1) erros.parcelas = 'Informe um número inteiro de parcelas.';
  if (String(taxaJurosMensal ?? '').trim() === '' || !(Number(taxaJurosMensal) >= 0)) {
    erros.taxaJurosMensal = 'Informe a taxa de juros mensal (zero ou mais).';
  }
  return erros;
}

export function proprietarioDoAutomovel(tipoPropriedade, pedido, agente) {
  const id = tipoPropriedade === TIPOS_PROPRIEDADE.CLIENTE ? pedido.clienteId : agente.id;
  return { tipo: tipoPropriedade, id };
}

export function descreverContrato(contrato) {
  const propriedade = `Automóvel de propriedade de ${contrato.tipoPropriedade.toLowerCase()}`;
  const credito = contrato.contratoCredito;
  if (!credito) return propriedade;
  const taxa = String(credito.taxaJurosMensal).replace('.', ',');
  return `${propriedade}. Crédito de ${formatarMoeda(credito.valor)} em ${credito.parcelas}x, ${taxa}% ao mês`;
}
