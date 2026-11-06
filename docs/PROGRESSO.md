# Progresso do LAB02

Registro por entrega. Os links dos Pull Requests estão em https://github.com/Arthur-Bicalho/DIW-Lab2/pulls?q=is%3Apr+is%3Amerged.

## Processo e ferramentas

- Skills usadas: `domain-modeling` (glossário e ADRs), `tdd` (regras e serviços), `code-review` (uma revisão com os eixos Padrões e Especificação por branch, executada por subagente), `pr` (formato dos Pull Requests), `codebase-design` (revisões de arquitetura).
- Skills do enunciado não instaladas neste ambiente: `/setup-matt-pocock-skills`, `/to-spec`, `/to-tickets`, `/implement`, `/improve-codebase-architecture`. O resultado foi reproduzido à mão (especificação em `docs/SPEC.md`, Issues pelo `gh`, revisões de arquitetura) e registrado no [ADR 0000](adr/0000-skills-ausentes.md).
- `diagnosing-bugs`: o bug do filtro do JSON Server foi diagnosticado por reprodução com `curl` (filtros numéricos não casam ids em texto), antes de qualquer correção; ver [ADR 0007](adr/0007-filtros-no-cliente.md).
- Rótulos criados: `modelagem`, `feature`, `bug`, `docs`.

## Entregas

| # | Entrega | Branch | Commits | Pull Request | Decisões |
|---|---------|--------|---------|--------------|----------|
| 1 | Setup e especificação | `docs/setup-projeto` | `1f09bb1` | [#12](https://github.com/Arthur-Bicalho/DIW-Lab2/pull/12) | ADR 0000 |
| 2 | Glossário, casos de uso, histórias | `docs/modelagem-casos-de-uso-historias` | `fa93a28`, `afa6e68` | [#13](https://github.com/Arthur-Bicalho/DIW-Lab2/pull/13) | ADR 0001 a 0005 |
| 3 | Diagramas de classes e pacotes | `docs/diagrama-classes-pacotes` | `42a7a53` | [#14](https://github.com/Arthur-Bicalho/DIW-Lab2/pull/14) | |
| 4 | Diagrama de componentes | `docs/diagrama-componentes` | `a19987f` | [#15](https://github.com/Arthur-Bicalho/DIW-Lab2/pull/15) | |
| 5 | JSON Server, db.json, API | `feature/setup-json-server` | `2184380` | [#16](https://github.com/Arthur-Bicalho/DIW-Lab2/pull/16) | |
| 6 | CRUD de Cliente | `feature/crud-cliente` | `df65447` | [#17](https://github.com/Arthur-Bicalho/DIW-Lab2/pull/17) | |
| 7 | Arquitetura após o CRUD | `refactor/arquitetura-cliente` | `1bd6661` | [#19](https://github.com/Arthur-Bicalho/DIW-Lab2/pull/19) | ADR 0006 |
| 8 | Cadastro e login simulado | `feature/autenticacao` | `7a06a4a` | [#20](https://github.com/Arthur-Bicalho/DIW-Lab2/pull/20) | Cliente gerencia só os próprios dados; Agente apenas consulta |
| 9 | Pedidos do Cliente | `feature/pedidos-cliente` | `77091ff` | [#21](https://github.com/Arthur-Bicalho/DIW-Lab2/pull/21) | ADR 0007; página `meus-pedidos` |
| 10 | Avaliação do Agente | `feature/avaliacao-agente` | `2dcbbb4` | [#22](https://github.com/Arthur-Bicalho/DIW-Lab2/pull/22) | |
| 11 | Contratos e crédito | `feature/contratos-credito` | `fd315b8` | [#23](https://github.com/Arthur-Bicalho/DIW-Lab2/pull/23) | O Banco que firma concede o crédito |
| 12 | Arquitetura após o protótipo | `refactor/arquitetura-prototipo` | `04f22fe` | [#25](https://github.com/Arthur-Bicalho/DIW-Lab2/pull/25) | ADR 0008 |
| 13 | README e progresso | `docs/readme` | ver `git log` | ver PR da branch | |

## Checklist de requisitos

| Requisito | Onde está |
|-----------|-----------|
| RF01 cadastro e login prévios | `public/cadastro.html`, `public/login.html`, `components/guarda.js`, `regras/permissoes.js`, `services/usuarioService.js` |
| RF02 CRUD de Cliente (RG, CPF, nome, endereço, profissão, até 3 entidades) | `public/clientes.html`, `views/clientes.js`, `services/clienteService.js`, `regras/cliente.js`; limite de 3 na interface (`components/entidadesEmpregadoras.js`) e na validação |
| RF03 Cliente cria, modifica, consulta e cancela Pedidos | `views/pedidos.js`, `services/pedidoService.js`, `regras/pedido.js` |
| RF04 Agente modifica e avalia | `views/avaliacao.js`, `components/dialogoAvaliacao.js`, `pedidoService.avaliar` e `modificarComoAgente` |
| RF05 Parecer positivo libera o Contrato | `pedidoService.avaliar` (APROVADO), `regras/contrato.js` (`agentePodeFirmarContrato`) |
| RF06 Automóvel | `db.json` (matrícula, ano, marca, modelo, placa), `services/automovelService.js` |
| RF07 Propriedade Cliente, Empresa ou Banco | `regras/contrato.js` (`proprietarioDoAutomovel`), `contratoService.firmar` |
| RF08 Contrato de Crédito de um Banco | `regras/contrato.js` (`podeConcederCredito`, `validarContratoCredito`), `components/dialogoContrato.js` |
| Dois perfis | `models/constantes.js` (PERFIS), `regras/permissoes.js` |
| Arquitetura cliente-servidor, dois subsistemas | `src/pedidos-contratos` e `src/paginas`; [pacotes](diagramas/pacotes.md) e [componentes](diagramas/componentes.md) |
| Stack obrigatória, sem outras bibliotecas | `package.json` (única dependência: json-server); Bootstrap por CDN |
| Fetch centralizado, alertas em falhas | `src/shared/api.js`, `src/shared/alertas.js` |
| Lógica pura e testada | `src/pedidos-contratos/regras`, `tests/` (77 testes) |
| Login simulado declarado | README, tela de login, [ADR 0004](adr/0004-login-simulado-e-perfis.md) |
| Responsivo e acessível | Bootstrap, `label` e `aria-*` nos formulários, sem JS inline |
| db.json com dados reais de exemplo | 3 clientes, 1 empresa, 2 bancos, 6 automóveis, 6 pedidos em todos os status, 1 contrato |
| Modelagem: casos de uso, histórias, classes, pacotes, componentes | `docs/diagramas/`, `docs/historias-de-usuario.md` |
| Glossário e ADRs | `GLOSSARY.md`, `docs/adr/` |

## Critérios de avaliação

| Critério | Evidência |
|----------|-----------|
| Qualidade do sistema | Fluxo completo cadastro, login, pedido, parecer, contrato, verificado no navegador a cada branch |
| Alinhamento entre modelos e código | Pastas de `src/` iguais aos pacotes; tabela classe para módulo no README; duas revisões de arquitetura (ADR 0006 e 0008) |
| Diagramas atualizados | Cada Pull Request de código alterou `pacotes.md` e `componentes.md`; ver "Histórico de alterações" no README |

## Roteiro de apresentação (5 minutos)

**0:00 a 0:45, o problema e a arquitetura.** Aluguel de carros com pedido, análise financeira e contrato. Mostre o diagrama de componentes: navegador, módulos JS, serviços Fetch, JSON Server, db.json, e os dois subsistemas do enunciado.

**0:45 a 1:45, modelo contra código.** Abra o diagrama de pacotes ao lado da árvore de `src/`: `pedidos-contratos` (models, regras, services) e `paginas` (views, components). Mostre a tabela do diagrama de classes: Pedido está em `regras/pedido.js` e `pedidoService.js`; Contrato e ContratoCredito em `regras/contrato.js`. Diga que as regras são funções puras, testadas sem navegador.

**1:45 a 2:45, demonstração do Cliente** (`ana@email.com`). Cadastro com CPF inválido e o 4º empregador impossível; login; criar Pedido; tentar um Automóvel ocupado; ver o status PENDENTE; cancelar.

**2:45 a 4:00, demonstração do Agente** (`horizonte@banco.com`). Iniciar análise, ver os rendimentos, tentar Parecer sem justificativa, aprovar, firmar o Contrato com Contrato de Crédito. Entrar como `veloz@empresa.com` e mostrar que a Empresa não vê a opção de crédito. Voltar ao Cliente e mostrar o contrato.

**4:00 a 4:40, o que mudou em relação ao modelo inicial.** (1) O JSON Server v1 não filtra ids em texto, então o filtro passou ao cliente (ADR 0007); (2) a página `pedidos.html` colidia com a rota `/pedidos` e virou `meus-pedidos.html`; (3) as duas revisões de arquitetura moveram regras para `cliente.js`, `erros.js` e `formatacao.js` e extraíram os diálogos de avaliação e contrato; (4) o Banco que firma o Contrato concede o crédito (ADR 0003).

**4:40 a 5:00, limites honestos.** Login simulado, sem autorização no servidor, sem transações; `npm test` com 77 testes.
