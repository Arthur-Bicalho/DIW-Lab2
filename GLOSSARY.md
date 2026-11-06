# Aluguel de Carros

Sistema web em que clientes pedem o aluguel de automóveis e agentes (empresas e bancos) avaliam o pedido e formalizam o contrato.

## Pessoas e perfis

**Usuário**:
Pessoa cadastrada que acessa o sistema por e-mail e senha, com um único perfil.
_Avoid_: Conta, login (como substantivo)

**Cliente**:
Usuário pessoa física que cria e acompanha os próprios pedidos.
_Avoid_: Locatário, consumidor

**Agente**:
Usuário que avalia e modifica pedidos; pode ser uma Empresa ou um Banco.
_Avoid_: Analista, funcionário, administrador

**Empresa**:
Agente que avalia pedidos e pode ser proprietária de automóveis.
_Avoid_: Locadora

**Banco**:
Agente que avalia pedidos e pode conceder Contrato de Crédito.
_Avoid_: Financeira, instituição financeira

**Entidade Empregadora**:
Organização que paga rendimento a um Cliente; cada Cliente informa no máximo três.
_Avoid_: Empregador, fonte de renda

**Rendimento**:
Valor mensal pago por uma Entidade Empregadora a um Cliente.
_Avoid_: Salário, renda

## Aluguel

**Automóvel**:
Veículo identificado por matrícula, ano, marca, modelo e placa, que pode ser alugado.
_Avoid_: Carro, veículo

**Categoria**:
Tipo de carroceria do Automóvel: Hatch, Sedan, SUV, Picape, Minivan ou Esportivo.
_Avoid_: Tipo, classe

**Segmento**:
Faixa de mercado do Automóvel: Popular ou Luxo.
_Avoid_: Nível, classe

**Elétrico**:
Indica que o Automóvel é movido a eletricidade; combina com qualquer Segmento.
_Avoid_: Ecológico, híbrido

**Catálogo**:
Página em que o Cliente consulta os Automóveis com foto e filtros e escolhe qual alugar.
_Avoid_: Vitrine, listagem

**Pedido**:
Solicitação de um Cliente para alugar um Automóvel por um período.
_Avoid_: Solicitação, requisição, reserva

**Status do Pedido**:
Etapa do Pedido: PENDENTE, EM_ANALISE, APROVADO, REPROVADO, CONTRATADO ou CANCELADO.
_Avoid_: Estado, situação

**Análise Financeira**:
Avaliação da capacidade de pagamento do Cliente feita por um Agente.
_Avoid_: Análise de crédito

**Parecer**:
Resultado da Análise Financeira, positivo ou negativo, com justificativa escrita pelo Agente.
_Avoid_: Veredito, resposta, feedback

**Contrato**:
Acordo de aluguel firmado a partir de um Pedido APROVADO.
_Avoid_: Locação

**Tipo de Propriedade**:
Define quem passa a constar como Proprietário do Automóvel no Contrato: CLIENTE, EMPRESA ou BANCO.
_Avoid_: Tipo de contrato

**Proprietário**:
Cliente, Empresa ou Banco registrado como dono do Automóvel locado.
_Avoid_: Dono

**Contrato de Crédito**:
Financiamento concedido por um Banco a um Contrato, com valor, parcelas e taxa de juros.
_Avoid_: Empréstimo, financiamento
