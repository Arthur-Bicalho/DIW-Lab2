const CAMPOS_DATA = [
  { nome: 'dataInicio', rotulo: 'Início' },
  { nome: 'dataFim', rotulo: 'Término' },
];

function criarGrupo(coluna, nome, rotulo, controle) {
  const grupo = document.createElement('div');
  grupo.className = coluna;
  grupo.innerHTML = `
    <label class="form-label" for="${nome}">${rotulo}</label>
    ${controle}
    <div class="invalid-feedback" id="erro-${nome}"></div>`;
  return grupo;
}

export function montarCamposPedido(container) {
  const seletor = criarGrupo('col-12', 'automovelId', 'Automóvel',
    '<select class="form-select" id="automovelId" name="automovelId" required aria-required="true" aria-describedby="erro-automovelId"></select>');
  const datas = CAMPOS_DATA.map(({ nome, rotulo }) => criarGrupo('col-md-6', nome, rotulo,
    `<input class="form-control" id="${nome}" name="${nome}" type="date" required aria-required="true" aria-describedby="erro-${nome}">`));
  container.append(seletor, ...datas);
}

export const descricaoAutomovel = (a) => `${a.marca} ${a.modelo} ${a.ano} (${a.placa})`;

export function preencherCamposPedido(formulario, automoveis, pedido, hoje) {
  const seletor = formulario.elements.automovelId;
  seletor.replaceChildren(...automoveis.map((a) => new Option(descricaoAutomovel(a), a.id)));
  seletor.selectedIndex = -1;
  formulario.elements.dataInicio.min = hoje;
  if (pedido) {
    seletor.value = pedido.automovelId;
    formulario.elements.dataInicio.value = pedido.dataInicio;
    formulario.elements.dataFim.value = pedido.dataFim;
  }
}

export function lerCamposPedido(formulario) {
  const { automovelId, dataInicio, dataFim } = formulario.elements;
  return { automovelId: automovelId.value, dataInicio: dataInicio.value, dataFim: dataFim.value };
}
