export function mostrarAlerta(mensagem, tipo = 'danger', area = document.getElementById('alertas')) {
  const alerta = document.createElement('div');
  alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
  alerta.setAttribute('role', 'alert');
  alerta.textContent = mensagem;

  const fechar = document.createElement('button');
  fechar.type = 'button';
  fechar.className = 'btn-close';
  fechar.setAttribute('data-bs-dismiss', 'alert');
  fechar.setAttribute('aria-label', 'Fechar');
  alerta.append(fechar);

  area.replaceChildren(alerta);
}
