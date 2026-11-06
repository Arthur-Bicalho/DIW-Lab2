import { obterSessao } from '../../shared/sessao.js';
import { paginaInicial, podeAcessarPagina } from '../../pedidos-contratos/regras/permissoes.js';

// Redireciona e interrompe o módulo da página quando o acesso não é permitido.
export function exigirAcesso(pagina) {
  const sessao = obterSessao();
  if (sessao && podeAcessarPagina(sessao.perfil, pagina)) return sessao;

  location.replace(sessao ? paginaInicial(sessao.perfil) : '/public/login.html');
  throw new Error('Acesso negado.');
}
