const CLASSES = {
  PENDENTE: 'text-bg-secondary',
  EM_ANALISE: 'text-bg-info',
  APROVADO: 'text-bg-success',
  REPROVADO: 'text-bg-danger',
  CONTRATADO: 'text-bg-primary',
  CANCELADO: 'text-bg-dark',
};

export function criarSeloStatus(status) {
  const selo = document.createElement('span');
  selo.className = `badge ${CLASSES[status]}`;
  selo.textContent = status.replace('_', ' ');
  return selo;
}
