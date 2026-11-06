import { recurso } from '../../shared/api.js';
import { PERFIS, STATUS_EM_ANDAMENTO } from '../models/constantes.js';
import { ErroValidacao, somenteDigitos, validarCliente } from '../regras/validacoes.js';

const usuarios = recurso('usuarios');
const pedidos = recurso('pedidos');

async function verificarDuplicidade(dados, idAtual) {
  const erros = {};
  const [porCpf, porEmail] = await Promise.all([
    usuarios.listar({ cpf: dados.cpf }),
    usuarios.listar({ email: dados.email }),
  ]);
  if (porCpf.some((u) => u.id !== idAtual)) erros.cpf = 'CPF já cadastrado.';
  if (porEmail.some((u) => u.id !== idAtual)) erros.email = 'E-mail já cadastrado.';
  if (Object.keys(erros).length) throw new ErroValidacao(erros);
}

async function prepararDados(dados, { edicao, idAtual }) {
  const erros = validarCliente(dados, { edicao });
  if (Object.keys(erros).length) throw new ErroValidacao(erros);

  const preparados = {
    ...dados,
    nome: dados.nome.trim(),
    email: dados.email.trim().toLowerCase(),
    cpf: somenteDigitos(dados.cpf),
    entidadesEmpregadoras: dados.entidadesEmpregadoras.map((e) => ({
      nome: e.nome.trim(),
      rendimento: Number(e.rendimento),
    })),
  };
  if (!preparados.senha) delete preparados.senha;
  await verificarDuplicidade(preparados, idAtual);
  return preparados;
}

export const clienteService = {
  listar: () => usuarios.listar({ perfil: PERFIS.CLIENTE }),

  obter: (id) => usuarios.obter(id),

  async criar(dados) {
    const preparados = await prepararDados(dados, { edicao: false });
    return usuarios.criar({ ...preparados, perfil: PERFIS.CLIENTE });
  },

  async atualizar(id, dados) {
    const preparados = await prepararDados(dados, { edicao: true, idAtual: id });
    return usuarios.atualizar(id, preparados);
  },

  async remover(id) {
    const cliente = await usuarios.obter(id);
    if (cliente.perfil !== PERFIS.CLIENTE) {
      throw new ErroValidacao({ geral: 'Apenas clientes podem ser excluídos por aqui.' });
    }
    const doCliente = await pedidos.listar({ clienteId: id });
    if (doCliente.some((p) => STATUS_EM_ANDAMENTO.includes(p.status))) {
      throw new ErroValidacao({ geral: 'O cliente possui pedidos em andamento e não pode ser excluído.' });
    }
    return usuarios.remover(id);
  },
};
