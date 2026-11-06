const CHAVE = 'sessao';

export function iniciarSessao(usuario) {
  const { id, nome, perfil } = usuario;
  sessionStorage.setItem(CHAVE, JSON.stringify({ id, nome, perfil }));
}

export function obterSessao() {
  const bruto = sessionStorage.getItem(CHAVE);
  return bruto ? JSON.parse(bruto) : null;
}

export function encerrarSessao() {
  sessionStorage.removeItem(CHAVE);
}
