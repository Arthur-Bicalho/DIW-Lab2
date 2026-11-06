const CLASSES = {
  PENDENTE: 'text-bg-secondary',
  EM_ANALISE: 'text-bg-info',
  APROVADO: 'text-bg-success',
  REPROVADO: 'text-bg-danger',
  CONTRATADO: 'text-bg-primary',
  CANCELADO: 'text-bg-dark',
};

export const rotuloStatus = (status) => status.replace('_', ' ');

export function criarSeloStatus(status) {
  const selo = document.createElement('span');
  selo.className = `badge ${CLASSES[status]}`;
  selo.textContent = rotuloStatus(status);
  return selo;
}
