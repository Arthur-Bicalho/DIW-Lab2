import { ErroValidacao } from '../../pedidos-contratos/regras/erros.js';
import { mostrarAlerta } from '../../shared/alertas.js';

export function limparErros(formulario) {
  formulario.querySelectorAll('.is-invalid').forEach((c) => {
    c.classList.remove('is-invalid');
    c.removeAttribute('aria-invalid');
  });
  formulario.querySelectorAll('.invalid-feedback').forEach((e) => {
    e.textContent = '';
    e.classList.remove('d-block');
  });
  formulario.querySelector('.alertas-formulario')?.replaceChildren();
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

export function mensagemDoErro(erro) {
  return erro instanceof ErroValidacao ? Object.values(erro.erros)[0] : erro.message;
}

// Erros de campo vão para o formulário; os demais viram alerta.
export function tratarErroDoFormulario(formulario, erro) {
  if (erro instanceof ErroValidacao && !erro.erros.geral) mostrarErros(formulario, erro.erros);
  else mostrarAlerta(mensagemDoErro(erro), 'danger', formulario.querySelector('.alertas-formulario') ?? undefined);
}
