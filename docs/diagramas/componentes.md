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
| components | `navbar`, `guarda` (exigirAcesso), `formulario`, `dialogoAvaliacao`, `dialogoContrato`, `tabela`, `statusPedido`, `camposCliente`, `camposPedido`, `entidadesEmpregadoras`: montam HTML Bootstrap e protegem páginas | alertas, sessao, regras/permissoes |
| services | `clienteService` (CRUD), `usuarioService.entrar`, `pedidoService` (criar, modificar, cancelar, iniciar análise, avaliar, listar por status), `contratoService` (firmar Contrato com Contrato de Crédito opcional), `automovelService` | regras, api |
| regras | funções puras de validação, formatação, transição e permissão; `ErroValidacao` | models |
| api.js | `requisitar(caminho, opcoes)` com tratamento de erro; `recurso(nome)` com filtro no cliente (ADR 0007) | Fetch API |
| JSON Server | `/usuarios`, `/automoveis`, `/pedidos`, `/contratos` | db.json |

## Visão de implantação

O diagrama acima descreve a execução local. A publicação na Vercel usa os mesmos componentes em outra implantação, descrita a seguir (ADR 0009).

```mermaid
flowchart TB
    subgraph local["Cenário A: local (npm start)"]
        nav1["Navegador"]
        subgraph proc["Processo Node: json-server db.json --static ."]
            js1["JSON Server (REST + arquivos estáticos)"]
        end
        db1[("db.json (leitura e gravação)")]
        nav1 -- "HTTP: páginas e /usuarios, /automoveis, /pedidos, /contratos" --> js1
        js1 -- "lê e grava" --> db1
    end

    subgraph vercel["Cenário B: Vercel"]
        nav2["Navegador"]
        subgraph build["Build: scripts/build.js"]
            fonte["public/ e src/"]
            dist["dist/"]
            fonte -- "cópia" --> dist
        end
        cdn["CDN estática da Vercel"]
        rw{"rewrites do vercel.json"}
        subgraph fn["Vercel Function: api/index.js"]
            api2["servidor/api.js: JSON Server em memória"]
        end
        seed[("db.json (semente, somente leitura)")]
        dist -- "publicado" --> cdn
        nav2 -- "GET /public/*.html e /src/*.js" --> cdn
        nav2 -- "/usuarios, /automoveis, /pedidos, /contratos" --> rw
        rw -- "destino /api" --> api2
        seed -- "carga inicial em cada instância" --> api2
    end
```

| Aspecto | A: local | B: Vercel |
|---------|----------|-----------|
| Processo | um processo Node contínuo (`npm start`) | Vercel Function efêmera, criada sob demanda |
| Persistência | `db.json` em disco, gravado a cada alteração | memória da instância; `db.json` é só a semente e volta ao estado inicial em cold start |
| Arquivos estáticos | servidos pelo JSON Server (`--static .`) | servidos pela CDN a partir de `dist/` |
| Para o usuário | dados permanecem entre execuções | dados de demonstração; podem sumir ou diferir entre instâncias |
