# Diagrama de Componentes

Visão de execução: o navegador carrega páginas HTML estáticas, cada uma com um módulo de view; as views usam serviços que falam com o JSON Server por Fetch. O JSON Server serve as páginas estáticas, expõe a API REST e persiste em `db.json`.

```mermaid
flowchart LR
    subgraph navegador["Navegador (Cliente ou Agente)"]
        subgraph html["public/*.html + Bootstrap 5 (CDN)"]
            index["index.html"]
            login["login.html"]
            cadastro["cadastro.html"]
            clientes["clientes.html"]
            pedidos["meus-pedidos.html"]
            avaliacao["avaliacao.html"]
            catalogo["catalogo.html"]
        end
        subgraph paginas["src/paginas"]
            views["views/*.js"]
            comp["components/*.js"]
        end
        subgraph pc["src/pedidos-contratos"]
            svc["services/*.js"]
            reg["regras/*.js"]
        end
        subgraph sh["src/shared"]
            api["api.js (Fetch)"]
            loc["armazenamento-local.js"]
            ses["sessao.js (sessionStorage)"]
            alr["alertas.js"]
        end
    end
    subgraph servidor["Servidor central"]
        js["JSON Server (REST + arquivos estáticos)"]
        db[("db.json")]
    end

    html --> views
    views --> comp
    views --> svc
    views --> reg
    views --> ses
    comp --> alr
    svc --> reg
    svc --> api
    api -. "modo local (Vercel)" .-> loc
    api -- "HTTP/JSON" --> js
    js --> db
    html -- "GET estático" --> js
```

| Componente | Interface | Depende de |
|------------|-----------|------------|
| views | funções de inicialização por página | components, services, regras, sessao |
| components | `navbar`, `guarda` (exigirAcesso), `formulario`, `dialogoAvaliacao`, `dialogoContrato`, `tabela`, `statusPedido`, `camposCliente`, `camposPedido`, `entidadesEmpregadoras`, `cartaoAutomovel`, `fotoAmpliada`, `paginacao`: montam HTML Bootstrap e protegem páginas | alertas, sessao, regras/permissoes |
| services | `clienteService` (CRUD), `usuarioService.entrar`, `pedidoService` (criar, modificar, cancelar, iniciar análise, avaliar, listar por status), `contratoService` (firmar Contrato com Contrato de Crédito opcional), `automovelService` | regras, api |
| regras | funções puras de validação, formatação, transição, permissão e filtro/paginação do catálogo (`automovel.js`); `ErroValidacao` | models |
| api.js | `requisitar(caminho, opcoes)` com tratamento de erro; `recurso(nome)` com filtro no cliente (ADR 0007), que delega a `recursoLocal` quando `modo.js` define `'local'` | Fetch API, armazenamento-local, modo |
| armazenamento-local.js | `recursoLocal(nome)` com a mesma interface de `recurso` (listar, obter, criar, atualizar, remover) sobre o `localStorage`; `restaurarDadosDeExemplo()`; semente de `/db.json` (ADR 0010) | localStorage, Fetch API |
| `public/img/carros/` | fotos dos automóveis, servidas como arquivos estáticos (ADR 0011) | — |
| JSON Server | `/usuarios`, `/automoveis`, `/pedidos`, `/contratos` | db.json |

## Visão de implantação

O diagrama acima descreve a execução local (cenário A). A publicação na Vercel usa os mesmos componentes do navegador, mas sem servidor de dados: `recurso()` escolhe `recursoLocal` e os dados ficam no `localStorage` (ADR 0010).

```mermaid
flowchart TB
    subgraph local["Cenário A: local (npm start)"]
        nav1["Navegador: api.js (Fetch)"]
        subgraph proc["Processo Node: json-server db.json --static ."]
            js1["JSON Server (REST + arquivos estáticos)"]
        end
        db1[("db.json (leitura e gravação)")]
        nav1 -- "HTTP: páginas e /usuarios, /automoveis, /pedidos, /contratos" --> js1
        js1 -- "lê e grava" --> db1
    end

    subgraph vercel["Cenário B: Vercel (estático)"]
        subgraph build["Build: ARMAZENAMENTO=local npm run build"]
            fonte["public/, src/ e db.json"]
            dist["dist/"]
            fonte -- "cópia + modo.js 'local'" --> dist
        end
        cdn["CDN estática da Vercel"]
        subgraph nav2["Navegador"]
            rl["recursoLocal (armazenamento-local.js)"]
            ls[("localStorage: aluguel:v1:*")]
        end
        dist -- "publicado" --> cdn
        cdn -- "páginas, scripts e /db.json (semente)" --> nav2
        rl -- "lê e grava" --> ls
    end
```

| Aspecto | A: local | B: Vercel |
|---------|----------|-----------|
| Processo | um processo Node contínuo (`npm start`) | nenhum: só arquivos estáticos na CDN |
| Persistência | `db.json` em disco, compartilhado por todos os navegadores | `localStorage` de cada navegador; `/db.json` é só a semente da primeira leitura |
| Arquivos estáticos | servidos pelo JSON Server (`--static .`) | servidos pela CDN a partir de `dist/` |
| Para o usuário | dados permanecem entre execuções e são comuns a todos | cada visitante vê só os próprios dados; limpar os dados do site apaga tudo |
