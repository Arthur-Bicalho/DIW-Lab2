# Diagrama de Componentes

Visão de execução: o navegador carrega páginas HTML estáticas, cada uma com um módulo de view; as views usam serviços que falam com o JSON Server por Fetch. O JSON Server serve as páginas estáticas, expõe a API REST e persiste em `db.json`.

```mermaid
flowchart LR
    subgraph navegador["Navegador (Cliente ou Agente)"]
        subgraph html["public/*.html + Bootstrap 5 (CDN)"]
            login["login.html"]
            cadastro["cadastro.html"]
            clientes["clientes.html"]
            pedidos["pedidos.html"]
            avaliacao["avaliacao.html"]
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
    api -- "HTTP/JSON" --> js
    js --> db
    html -- "GET estático" --> js
```

| Componente | Interface | Depende de |
|------------|-----------|------------|
| views | funções de inicialização por página | components, services, regras, sessao |
| components | funções que montam HTML Bootstrap | alertas |
| services | `listar`, `obter`, `criar`, `atualizar`, `remover` e operações de negócio | regras, api |
| regras | funções puras de validação, formatação, transição e permissão; `ErroValidacao` | models |
| api.js | `requisitar(caminho, opcoes)` com tratamento de erro | Fetch API |
| JSON Server | `/usuarios`, `/automoveis`, `/pedidos`, `/contratos` | db.json |
