export const PERFIS = Object.freeze({
  CLIENTE: 'CLIENTE',
  EMPRESA: 'EMPRESA',
  BANCO: 'BANCO',
});

export const STATUS_PEDIDO = Object.freeze({
  PENDENTE: 'PENDENTE',
  EM_ANALISE: 'EM_ANALISE',
  APROVADO: 'APROVADO',
  REPROVADO: 'REPROVADO',
  CONTRATADO: 'CONTRATADO',
  CANCELADO: 'CANCELADO',
});

export const TIPOS_PROPRIEDADE = Object.freeze({
  CLIENTE: 'CLIENTE',
  EMPRESA: 'EMPRESA',
  BANCO: 'BANCO',
});

export const MAX_ENTIDADES_EMPREGADORAS = 3;

export const STATUS_EM_ANDAMENTO = Object.freeze([
  STATUS_PEDIDO.PENDENTE,
  STATUS_PEDIDO.EM_ANALISE,
  STATUS_PEDIDO.APROVADO,
]);

export const CATEGORIAS_AUTOMOVEL = Object.freeze({
  HATCH: 'Hatch',
  SEDAN: 'Sedan',
  SUV: 'SUV',
  PICAPE: 'Picape',
  MINIVAN: 'Minivan',
  ESPORTIVO: 'Esportivo',
});

export const SEGMENTOS_AUTOMOVEL = Object.freeze({
  POPULAR: 'Popular',
  LUXO: 'Luxo',
});

export const ANO_MINIMO_AUTOMOVEL = 2016;

export const ITENS_POR_PAGINA = 12;
