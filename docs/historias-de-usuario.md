# Histórias de Usuário

Formato: "Como (ator), quero (ação), para (benefício)". Os requisitos RF referem-se a `docs/SPEC.md`.

## HU01 – Cadastro (RF01, RF02)
Como visitante, quero me cadastrar como Cliente, para poder usar o sistema.
- Dado um CPF inválido, o cadastro é recusado com mensagem junto ao campo.
- Dado e-mail já cadastrado, o cadastro é recusado.
- Informo RG, CPF, nome, endereço e profissão; todos são obrigatórios.
- Posso informar até 3 Entidades Empregadoras, cada uma com Rendimento; o botão de adicionar some ao chegar a 3.

## HU02 – Login (RF01)
Como Usuário cadastrado, quero entrar com e-mail e senha, para acessar as funções do meu perfil.
- Credenciais corretas levam à página inicial do meu perfil.
- Credenciais erradas exibem alerta e não criam sessão.
- Sem sessão, qualquer página interna redireciona para o login.
- Perfil sem permissão para a página é redirecionado.

## HU03 – Manter dados do Cliente (RF02)
Como Cliente, quero consultar, alterar e excluir meus dados, para mantê-los atualizados.
- Alterações seguem as mesmas validações do cadastro.
- Excluir pede confirmação; Cliente com Pedido em andamento (PENDENTE, EM_ANALISE, APROVADO) não pode ser excluído.
- O Agente lista e consulta Clientes.

## HU04 – Criar Pedido (RF03, RF06)
Como Cliente, quero pedir o aluguel de um Automóvel por um período, para usá-lo.
- Escolho um Automóvel disponível (sem Pedido ativo) e informo datas de início e fim.
- A data final deve ser posterior à inicial e a inicial não pode estar no passado.
- O Pedido nasce PENDENTE.

## HU05 – Consultar status (RF03)
Como Cliente, quero ver meus Pedidos e o status de cada um, para acompanhar a análise.
- Vejo somente meus Pedidos.
- Pedidos avaliados mostram o Parecer.

## HU06 – Modificar Pedido (RF03)
Como Cliente, quero alterar Automóvel e datas de um Pedido, para corrigir o que pedi.
- Só é possível enquanto o status é PENDENTE.

## HU07 – Cancelar Pedido (RF03)
Como Cliente, quero cancelar um Pedido, para desistir do aluguel.
- Permitido em PENDENTE, EM_ANALISE e APROVADO; nunca em CONTRATADO.
- Peço confirmação antes de cancelar.

## HU08 – Listar e modificar Pedidos (RF04)
Como Agente, quero listar Pedidos por status e modificá-los, para tratar a fila de análise.
- Posso filtrar a lista por status.
- Posso modificar Automóvel e datas de Pedidos PENDENTE ou EM_ANALISE.

## HU09 – Avaliar Pedido (RF04, RF05)
Como Agente, quero analisar a situação financeira do Cliente e emitir um Parecer, para decidir sobre o Pedido.
- Ao iniciar a análise, o Pedido passa a EM_ANALISE e fica atribuído a mim.
- Vejo os Rendimentos do Cliente e sua soma.
- Aprovar ou reprovar exige Parecer com justificativa.
- Parecer positivo muda o Pedido para APROVADO, disponível para contrato.

## HU10 – Firmar Contrato (RF05, RF07)
Como Agente, quero firmar o Contrato de um Pedido aprovado, para concluir o aluguel.
- Só Pedidos APROVADO podem ter Contrato.
- Escolho o Tipo de Propriedade (CLIENTE, EMPRESA ou BANCO); o Proprietário do Automóvel é atualizado.
- O Pedido passa a CONTRATADO.

## HU11 – Conceder Contrato de Crédito (RF08)
Como Banco, quero conceder crédito a um Contrato, para financiar o aluguel.
- Informo valor, número de parcelas e taxa de juros mensal.
- Uma Empresa não vê essa opção.
- Cada Contrato tem no máximo um Contrato de Crédito.
