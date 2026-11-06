import { pedidoService } from '../../pedidos-contratos/services/pedidoService.js';
import { STATUS_PEDIDO } from '../../pedidos-contratos/models/constantes.js';
import { rendimentoTotal } from '../../pedidos-contratos/regras/cliente.js';
import { dataDeHoje, formatarMoeda } from '../../pedidos-contratos/regras/formatacao.js';
import { mostrarAlerta } from '../../shared/alertas.js';
import { limparErros, tratarErroDoFormulario } from './formulario.js';

export function criarDialogoAvaliacao({ sessao, aoConcluir }) {
  const formulario = document.getElementById('form-avaliacao');
  const modal = new bootstrap.Modal(document.getElementById('modal-avaliacao'));
  let pedido = null;

  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    limparErros(formulario);
    const escolha = formulario.elements.positivo.value;
    const parecer = {
      positivo: escolha === '' ? undefined : escolha === 'true',
      justificativa: formulario.elements.justificativa.value,
    };
    try {
      const avaliado = await pedidoService.avaliar(pedido.id, sessao.id, parecer, dataDeHoje());
      modal.hide();
      const resultado = avaliado.status === STATUS_PEDIDO.APROVADO ? 'aprovado e disponível para contrato' : 'reprovado';
      mostrarAlerta(`Pedido ${resultado}.`, 'success');
      await aoConcluir();
    } catch (erro) {
      tratarErroDoFormulario(formulario, erro);
    }
  });

  return {
    abrir(pedidoAvaliado, cliente) {
      pedido = pedidoAvaliado;
      limparErros(formulario);
      formulario.reset();
      document.getElementById('resumo-cliente').textContent = `${cliente.nome}, ${cliente.profissao}`;
      document.getElementById('lista-rendimentos').replaceChildren(
        ...cliente.entidadesEmpregadoras.map((e) => {
          const item = document.createElement('li');
          item.textContent = `${e.nome}: ${formatarMoeda(e.rendimento)}`;
          return item;
        }),
      );
      document.getElementById('total-rendimentos').textContent = `Rendimento total: ${formatarMoeda(rendimentoTotal(cliente.entidadesEmpregadoras))}`;
      modal.show();
    },
  };
}
