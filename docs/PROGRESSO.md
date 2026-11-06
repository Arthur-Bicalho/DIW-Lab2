# Progresso do LAB02

Registro por entrega. Os links dos Pull Requests estão em https://github.com/Arthur-Bicalho/DIW-Lab2/pulls?q=is%3Apr+is%3Amerged.

## Processo e ferramentas

- Skills usadas: `domain-modeling` (glossário e ADRs), `tdd` (regras e serviços), `code-review` (uma revisão com os eixos Padrões e Especificação por branch, executada por subagente), `pr` (formato dos Pull Requests), `codebase-design` (revisões de arquitetura).
- Skills do enunciado não instaladas neste ambiente: `/setup-matt-pocock-skills`, `/to-spec`, `/to-tickets`, `/implement`, `/improve-codebase-architecture`. O resultado foi reproduzido à mão (especificação em `docs/SPEC.md`, Issues pelo `gh`, revisões de arquitetura) e registrado no [ADR 0000](adr/0000-skills-ausentes.md).
- `diagnosing-bugs`: o bug do filtro do JSON Server foi diagnosticado por reprodução com `curl` (filtros numéricos não casam ids em texto), antes de qualquer correção; ver [ADR 0007](adr/0007-filtros-no-cliente.md).
- O deploy no Vercel foi o maior desvio do plano: a tentativa com Function (ADR 0009) falhou em produção e foi substituída pelo armazenamento no navegador (ADR 0010); a história está no README, seção "O problema do JSON Server e como foi resolvido".
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
| 13 | README e progresso | `docs/readme` | `9e2bf3d`, `a86638a` | [#26](https://github.com/Arthur-Bicalho/DIW-Lab2/pull/26) | |
| 14 | Deploy no Vercel com JSON Server em Function | `feature/deploy-vercel` | `fd87807`, `4064590`, `6d4a7c5`, `e28872d` | [#28](https://github.com/Arthur-Bicalho/DIW-Lab2/pull/28) | ADR 0009 (depois substituído) |
| 15 | Correção: pasta `public` na Function (`ENOENT`) | `fix/function-pasta-public` | `ebb985e`, `e6e9c7c` | [#30](https://github.com/Arthur-Bicalho/DIW-Lab2/pull/30) | |
| 16 | Correção: parâmetros do rewrite nas listagens | `fix/rewrites-listagem` | `f5e4f9a` | [#32](https://github.com/Arthur-Bicalho/DIW-Lab2/pull/32) | |
| 17 | Armazenamento no navegador; remoção da Function | direto na `main` (Issue #33) | `a8ca298`, `77c0b40` | sem Pull Request, por erro de processo | ADR 0010 |
| 18 | Catálogo de automóveis com filtros e fotos | `feature/catalogo-automoveis` | `91ef83d`, `3905e9f` | [#38](https://github.com/Arthur-Bicalho/DIW-Lab2/pull/38) | ADR 0011 |
| 19 | Frota ampliada (66 automóveis, uma foto por carro) | `feature/frota-ampliada` | `4fb53e5`, `b455a2c` | [#39](https://github.com/Arthur-Bicalho/DIW-Lab2/pull/39) | créditos das imagens |
| 20 | README completo, deploy estático e progresso | `docs/readme-deploy` (Issue #37) | | [#40](https://github.com/Arthur-Bicalho/DIW-Lab2/pull/40) | |

A etapa "login sem cadastro" (Issue #34) foi proposta e cancelada para manter o RF01; não houve código nem Pull Request.

## Checklist de requisitos

| Requisito | Onde está |
|-----------|-----------|
| RF01 cadastro e login prévios | `public/cadastro.html`, `public/login.html`, `components/guarda.js`, `regras/permissoes.js`, `services/usuarioService.js` |
| RF02 CRUD de Cliente (RG, CPF, nome, endereço, profissão, até 3 entidades) | `public/clientes.html`, `views/clientes.js`, `services/clienteService.js`, `regras/cliente.js`; limite de 3 na interface (`components/entidadesEmpregadoras.js`) e na validação |
| RF03 Cliente cria, modifica, consulta e cancela Pedidos | `views/pedidos.js`, `services/pedidoService.js`, `regras/pedido.js` |
| RF04 Agente modifica e avalia | `views/avaliacao.js`, `components/dialogoAvaliacao.js`, `pedidoService.avaliar` e `modificarComoAgente` |
| RF05 Parecer positivo libera o Contrato | `pedidoService.avaliar` (APROVADO), `regras/contrato.js` (`agentePodeFirmarContrato`) |
| RF06 Automóvel | `db.json` (matrícula, ano, marca, modelo, placa, e também categoria, segmento, eletrico e imagem), `services/automovelService.js`; catálogo em `public/catalogo.html`, `views/catalogo.js`, `regras/automovel.js`, `components/cartaoAutomovel.js` e `fotoAmpliada.js` |
| RF07 Propriedade Cliente, Empresa ou Banco | `regras/contrato.js` (`proprietarioDoAutomovel`), `contratoService.firmar` |
| RF08 Contrato de Crédito de um Banco | `regras/contrato.js` (`podeConcederCredito`, `validarContratoCredito`), `components/dialogoContrato.js` |
| Dois perfis | `models/constantes.js` (PERFIS), `regras/permissoes.js` |
| Arquitetura cliente-servidor, dois subsistemas | `src/pedidos-contratos` e `src/paginas`; [pacotes](diagramas/pacotes.md) e [componentes](diagramas/componentes.md) |
| Stack obrigatória, sem outras bibliotecas | `package.json` (única dependência: json-server, em `devDependencies`); Bootstrap por CDN |
| JSON Server como API local | `npm start` (`json-server db.json --static .`) e `db.json`; no Vercel, `src/shared/armazenamento-local.js` ([ADR 0010](adr/0010-armazenamento-no-navegador-no-vercel.md)) |
| Publicação | `vercel.json`, `scripts/build.js`, https://aluguel-de-carros-rosy.vercel.app |
| Fetch centralizado, alertas em falhas | `src/shared/api.js`, `src/shared/alertas.js` |
| Lógica pura e testada | `src/pedidos-contratos/regras`, `tests/` (112 testes) |
| Login simulado declarado | README, tela de login, [ADR 0004](adr/0004-login-simulado-e-perfis.md) |
| Responsivo e acessível | Bootstrap, `label` e `aria-*` nos formulários, sem JS inline |
| db.json com dados reais de exemplo | 3 clientes, 1 empresa, 2 bancos, 66 automóveis (41 populares, 25 de luxo, 13 elétricos, modelos de 2019 a 2024; a regra de inclusão é no máximo 10 anos, ou seja, 2016 em diante; com foto e crédito), 6 pedidos em todos os status, 1 contrato |
| Modelagem: casos de uso, histórias, classes, pacotes, componentes | `docs/diagramas/`, `docs/historias-de-usuario.md` |
| Glossário e ADRs | `GLOSSARY.md`, `docs/adr/` (12 ADRs, lista abaixo) |

## Critérios de avaliação

| Critério | Evidência |
|----------|-----------|
| Qualidade do sistema | Fluxo completo cadastro, login, pedido, parecer, contrato, verificado no navegador a cada branch |
| Alinhamento entre modelos e código | Pastas de `src/` iguais aos pacotes; tabela classe para módulo no README; duas revisões de arquitetura (ADR 0006 e 0008) |
| Diagramas atualizados | Todo Pull Request que mudou a estrutura (pacotes, componentes, classes ou casos de uso) alterou o diagrama afetado na mesma branch, inclusive a visão de implantação e o catálogo; as correções de #30 e #32 e a frota de #39 não mudaram estrutura. Ver "Histórico de alterações" no README |
| Publicação | Site no ar em https://aluguel-de-carros-rosy.vercel.app, com a história do JSON Server no Vercel documentada e as limitações declaradas |

## Roteiro de apresentação (5 minutos)

**0:00 a 0:40, o problema e a arquitetura.** Aluguel de carros com catálogo, pedido, análise financeira e contrato. Mostre o diagrama de fluxo do README: página HTML, view, service, regras puras, `recurso()` e os dois destinos de dados (JSON Server ou `localStorage`).

**0:40 a 1:20, modelo contra código.** Abra o diagrama de pacotes ao lado da árvore de `src/`: `pedidos-contratos` (models, regras, services) e `paginas` (views, components). Na tabela classe para módulo: Pedido em `regras/pedido.js` e `pedidoService.js`; Automovel (com categoria, segmento, eletrico e imagem) em `regras/automovel.js`. As regras são funções puras, testadas sem navegador (112 testes).

**1:20 a 2:20, Cliente no site publicado** (https://aluguel-de-carros-rosy.vercel.app). Cadastro com CPF inválido e o 4º empregador impossível; login com a senha conferida (login simulado, ADR 0004). No catálogo: filtrar por luxo, SUV e somente elétricos, buscar um modelo sem acento, "Ver foto" com o crédito, "Alugar" abrindo o pedido com o carro, e o carro ocupado como Indisponível. Criar o Pedido e ver PENDENTE.

**2:20 a 3:30, Agente e Contrato.** Entrar como `horizonte@banco.com`, iniciar a análise, ver os rendimentos, tentar o Parecer sem justificativa, aprovar e firmar o Contrato com Contrato de Crédito. Entrar como `veloz@empresa.com` e mostrar que a Empresa não vê a opção de crédito. Voltar ao Cliente e mostrar o contrato. Lembrar que no site publicado os dados ficam no navegador: tudo isso precisa ser feito no mesmo navegador.

**3:30 a 4:30, a história do JSON Server no Vercel.** O Vercel não tem processo permanente nem disco gravável. Tentativa 1: JSON Server numa Function (ADR 0009), com os problemas `ENOENT` por causa da pasta `public`, listagens vazias por causa dos parâmetros do rewrite e, sem conserto, dados diferentes em cada instância (em uma verificação manual em produção, 2 de 3 logins logo após o cadastro falharam). Solução: build estático com os dados no `localStorage` (ADR 0010), mesma interface em `recurso()`, sem mudar services, views nem regras. Localmente, `npm start` continua com o JSON Server. Outros dois problemas tratados: `pedidos.html` colidia com `/pedidos` (virou `meus-pedidos.html`) e o filtro por id em texto passou ao cliente (ADR 0007).

**4:30 a 5:00, limites honestos.** Login simulado, sem autorização no servidor, sem transações; na publicação cada visitante vê só os próprios dados. A entrega do armazenamento no navegador entrou direto na `main`, sem Pull Request, e a etapa "login sem cadastro" foi cancelada para manter o RF01.

## Decisões de arquitetura (12 ADRs)

| ADR | Título | Status |
|-----|--------|--------|
| [0000](adr/0000-skills-ausentes.md) | Skills de planejamento indisponíveis | aceita |
| [0001](adr/0001-fluxo-de-status-do-pedido.md) | Fluxo de status do Pedido | aceita |
| [0002](adr/0002-agente-avalia-pedidos.md) | Qual Agente avalia qual Pedido | aceita |
| [0003](adr/0003-propriedade-e-contratos.md) | Tipo de Propriedade e Contrato de Crédito | aceita |
| [0004](adr/0004-login-simulado-e-perfis.md) | Login simulado e permissões por perfil | aceita |
| [0005](adr/0005-uml-em-mermaid.md) | Diagramas em Mermaid | aceita |
| [0006](adr/0006-regras-por-conceito-do-dominio.md) | Regras organizadas por conceito do domínio | aceita |
| [0007](adr/0007-filtros-no-cliente.md) | Filtros aplicados no cliente | aceita |
| [0008](adr/0008-dialogos-como-componentes.md) | Diálogos do Agente como componentes | aceita |
| [0009](adr/0009-deploy-vercel-json-server-em-funcao.md) | Deploy na Vercel com JSON Server em função | substituída pela 0010 |
| [0010](adr/0010-armazenamento-no-navegador-no-vercel.md) | Armazenamento no navegador na publicação da Vercel | aceita |
| [0011](adr/0011-classificacao-dos-automoveis-e-fotos.md) | Classificação dos automóveis e fotos no catálogo | aceita |

## Limitações

- Login simulado: senha em texto no `db.json`, sessão no `sessionStorage`, permissões só na interface (ADR 0004).
- Sem controle de versão nem transações: dois Agentes podem se sobrescrever ao iniciar a análise, e `firmar` grava Contrato, Pedido e Automóvel em três chamadas.
- A disponibilidade do Automóvel considera Pedido ativo, não sobreposição de datas.
- Publicação com dados por navegador: sem compartilhamento entre pessoas, o cadastro de um navegador não existe em outro, e limpar os dados do site apaga tudo (não há tela de restaurar).
- A foto do Renault Kwid E-Tech (id 53) tem como autor no Commons apenas o link de um vídeo do YouTube (ADR 0011).
- Não há suíte E2E automatizada; as telas foram verificadas manualmente.
- As capturas `meus-dados`, `clientes-validacao` e `pedidos-cliente` são anteriores ao link Catálogo na barra do Cliente.
