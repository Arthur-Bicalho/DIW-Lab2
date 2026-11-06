import { recurso } from '../../shared/api.js';
import { ErroValidacao } from '../regras/erros.js';

const usuarios = recurso('usuarios');

export const usuarioService = {
  async entrar(email, senha) {
    const [usuario] = await usuarios.listar({ email: email.trim().toLowerCase() });
    if (!usuario || usuario.senha !== senha) {
      throw new ErroValidacao({ geral: 'E-mail ou senha incorretos.' });
    }
    return usuario;
  },
};
