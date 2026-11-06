export function limparErros(formulario) {
  formulario.querySelectorAll('.is-invalid').forEach((c) => {
    c.classList.remove('is-invalid');
    c.removeAttribute('aria-invalid');
  });
  formulario.querySelectorAll('.invalid-feedback').forEach((e) => {
    e.textContent = '';
  });
}

export function mostrarErros(formulario, erros) {
  for (const [campo, mensagem] of Object.entries(erros)) {
    const mensagemEl = formulario.querySelector(`#erro-${campo}`);
    if (mensagemEl) mensagemEl.textContent = mensagem;
    const entrada = formulario.elements[campo]
      ?? (campo === 'entidadesEmpregadoras' ? formulario.querySelectorAll('.entidade input') : null);
    for (const el of entrada instanceof NodeList ? entrada : [entrada]) {
      el?.classList.add('is-invalid');
      el?.setAttribute('aria-invalid', 'true');
    }
    mensagemEl?.classList.add('d-block');
  }
}
