# Regras organizadas por conceito do domínio

Status: aceita

Após o CRUD de Cliente, `regras/validacoes.js` misturava a classe de erro, um utilitário de texto e as regras de Cliente, e `formatacao.js` dependia dele. Foi dividido em `cliente.js` (regras da classe Cliente), `erros.js` e `formatacao.js`, sem dependência circular; as regras de Pedido entram como `pedido.js` e `permissoes.js`. Alternativas descartadas: manter um `validacoes.js` genérico (esconde qual classe do UML cada regra serve) e criar uma pasta por classe (complexidade sem ganho para este tamanho). Diagramas de pacotes e componentes atualizados.
