import { contratoService } from '../../pedidos-contratos/services/contratoService.js';
import { podeConcederCredito, tiposPropriedadePermitidos } from '../../pedidos-contratos/regras/contrato.js';
import { dataDeHoje } from '../../pedidos-contratos/regras/formatacao.js';
import { mostrarAlerta } from '../../shared/alertas.js';
import { limparErros, tratarErroDoFormulario } from './formulario.js';

export function criarDialogoContrato({ sessao, aoConcluir }) {
  const formulario = document.getElementById('form-contrato');
  const modal = new bootstrap.Modal(document.getElementById('modal-contrato'));
  const camposCredito = document.getElementById('campos-credito');
  let pedido = null;

  formulario.elements.comCredito.addEventListener('change', (evento) => {
    camposCredito.hidden = !evento.target.checked;
  });

  formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    limparErros(formulario);
    const { tipoPropriedade, comCredito, valor, parcelas, taxaJurosMensal } = formulario.elements;
    const dados = {
      tipoPropriedade: tipoPropriedade.value,
      credito: comCredito.checked
        ? { valor: valor.value, parcelas: parcelas.value, taxaJurosMensal: taxaJurosMensal.value }
        : null,
    };
    try {
      await contratoService.firmar(pedido.id, sessao, dados, dataDeHoje());
      modal.hide();
      mostrarAlerta('Contrato firmado.', 'success');
      await aoConcluir();
    } catch (erro) {
      tratarErroDoFormulario(formulario, erro);
    }
  });

  return {
    abrir(pedidoContratado) {
      pedido = pedidoContratado;
      limparErros(formulario);
      formulario.reset();
      formulario.elements.tipoPropriedade.replaceChildren(
        ...tiposPropriedadePermitidos(sessao.perfil).map((tipo) => new Option(`Propriedade de ${tipo.toLowerCase()}`, tipo)),
      );
      formulario.elements.tipoPropriedade.selectedIndex = -1;
      document.getElementById('area-credito').hidden = !podeConcederCredito(sessao.perfil);
      camposCredito.hidden = true;
      modal.show();
    },
  };
}
