import { usuarioService } from '../../pedidos-contratos/services/usuarioService.js';
import { ErroValidacao } from '../../pedidos-contratos/regras/erros.js';
import { paginaInicial } from '../../pedidos-contratos/regras/permissoes.js';
import { iniciarSessao } from '../../shared/sessao.js';
import { mostrarAlerta } from '../../shared/alertas.js';

document.getElementById('form-login').addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const { email, senha } = evento.target.elements;
  try {
    const usuario = await usuarioService.entrar(email.value, senha.value);
    iniciarSessao(usuario);
    location.href = paginaInicial(usuario.perfil);
  } catch (erro) {
    mostrarAlerta(erro instanceof ErroValidacao ? erro.erros.geral : erro.message);
  }
});
