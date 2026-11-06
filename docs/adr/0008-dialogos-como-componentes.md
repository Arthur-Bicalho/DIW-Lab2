# Diálogos do Agente como componentes

Status: aceita

Após o protótipo, `views/avaliacao.js` tinha 196 linhas e três fluxos de modal (modificar, avaliar, firmar contrato) compartilhando `pedidoEmEdicao`. Avaliação e contrato foram extraídos para `components/dialogoAvaliacao.js` e `components/dialogoContrato.js`, cada um com a interface `abrir(pedido)` e um callback `aoConcluir`, guardando o próprio estado; a view só monta a tabela e abre os diálogos. Descartado: um componente genérico de modal, que serviria a três usos e esconderia as regras de cada um. A revisão também confirmou que `regras/` e `services/` já espelham as classes Pedido, Contrato e Cliente do diagrama de classes, sem mudanças.
