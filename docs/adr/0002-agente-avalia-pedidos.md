# Qual Agente avalia qual Pedido

Status: aceita

Qualquer Agente (Empresa ou Banco) pode iniciar a análise de um Pedido PENDENTE; ao iniciar, o Pedido passa a EM_ANALISE e guarda o `agenteId`. Só esse Agente emite o Parecer. O enunciado não define distribuição; atribuir por quem assume evita regra de roteamento que a especificação não pede. Qualquer Agente pode modificar um Pedido PENDENTE ou EM_ANALISE.
