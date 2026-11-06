import { clienteService } from '../../pedidos-contratos/services/clienteService.js';
import { paginaInicial } from '../../pedidos-contratos/regras/permissoes.js';
import { iniciarSessao } from '../../shared/sessao.js';
import { limparErros, tratarErroDoFormulario } from '../components/formulario.js';
import { lerCamposCliente, montarCamposCliente } from '../components/camposCliente.js';
import { iniciarEntidadesEmpregadoras } from '../components/entidadesEmpregadoras.js';

const formulario = document.getElementById('form-cliente');
montarCamposCliente(document.getElementById('campos'));
const entidades = iniciarEntidadesEmpregadoras(
  document.getElementById('entidades'),
  document.getElementById('adicionar-entidade'),
);

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  limparErros(formulario);
  const dados = { ...lerCamposCliente(formulario), entidadesEmpregadoras: entidades.ler() };
  try {
    const cliente = await clienteService.criar(dados);
    iniciarSessao(cliente);
    location.href = paginaInicial(cliente.perfil);
  } catch (erro) {
    tratarErroDoFormulario(formulario, erro);
  }
});
