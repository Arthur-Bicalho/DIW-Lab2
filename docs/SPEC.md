# Especificação – Sistema de Aluguel de Carros

Documento de planejamento derivado do enunciado do LAB02. Cada item da seção
"Entregas" corresponde a uma Issue e a uma branch.

## Objetivo

Sistema web para gerenciar aluguéis de automóveis. Pedidos de aluguel podem ser
criados, cancelados e modificados pela Internet. Arquitetura cliente-servidor: um
servidor central (JSON Server) acessado pelos navegadores de clientes e agentes.

## Perfis

- **Cliente** (pessoa física): cria, modifica, consulta e cancela os próprios pedidos.
- **Agente** (Empresa ou Banco): modifica e avalia pedidos, emite parecer financeiro.
  O Banco também pode conceder Contrato de Crédito.

## Requisitos funcionais

| Id | Requisito |
|----|-----------|
| RF01 | O uso do sistema exige cadastro prévio e login. |
| RF02 | CRUD de Cliente com RG, CPF, nome, endereço, profissão e até 3 entidades empregadoras, cada uma com rendimento. |
| RF03 | O Cliente cria, modifica, consulta e cancela pedidos próprios. |
| RF04 | O Agente lista, modifica e avalia pedidos (aprova ou reprova com parecer). |
| RF05 | Parecer positivo disponibiliza o pedido para execução do contrato. |
| RF06 | Automóvel com matrícula, ano, marca, modelo e placa. |
| RF07 | O automóvel locado é registrado como propriedade de Cliente, Empresa ou Banco, conforme o tipo de contrato. |
| RF08 | O aluguel pode ter Contrato de Crédito concedido por um Banco agente. |

## Requisitos não funcionais

HTML5, CSS3 e JavaScript puro (módulos ES); Bootstrap 5 via CDN; JSON Server com
Fetch API; testes com `node --test`; layout responsivo e formulários acessíveis;
login simulado (sessionStorage), sem autenticação real.

## Entregas (Issues / branches)

1. `docs/setup-projeto` – labels, .gitignore, ADRs iniciais, especificação.
2. `docs/modelagem-casos-de-uso-historias` – glossário, ADRs de domínio, casos de uso, histórias.
3. `docs/diagrama-classes-pacotes` – diagramas de classes e de pacotes.
4. `docs/diagrama-componentes` – diagrama de componentes.
5. `feature/setup-json-server` – package.json, db.json, estrutura de pastas, camada de API.
6. `feature/crud-cliente` – CRUD de Cliente e regras de validação.
7. `feature/autenticacao` – cadastro e login simulado, proteção por perfil.
8. `feature/pedidos-cliente` – criar, modificar, consultar e cancelar pedidos.
9. `feature/avaliacao-agente` – listar, avaliar e modificar pedidos.
10. `feature/contratos-credito` – Contrato de aluguel e Contrato de Crédito.
11. `docs/readme` – README, histórico de alterações, progresso e checklist.
