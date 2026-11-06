# Diagrama de Classes

Cliente, Empresa e Banco herdam de Usuário (Empresa e Banco por meio de Agente). No `db.json` todos os Usuários ficam na coleção `usuarios`, distinguidos pelo campo `perfil`. O Parecer fica dentro do Pedido e o Contrato de Crédito dentro do Contrato.

```mermaid
classDiagram
    class Usuario {
        +id
        +nome
        +email
        +senha
        +perfil
    }
    class Cliente {
        +rg
        +cpf
        +endereco
        +profissao
        +entidadesEmpregadoras
    }
    class Agente
    class Empresa
    class Banco
    class EntidadeEmpregadora {
        +nome
        +rendimento
    }
    class Automovel {
        +id
        +matricula
        +ano
        +marca
        +modelo
        +placa
        +proprietario
    }
    class Pedido {
        +id
        +dataInicio
        +dataFim
        +status
        +agenteId
    }
    class Parecer {
        +positivo
        +justificativa
        +data
    }
    class Contrato {
        +id
        +tipoPropriedade
        +data
    }
    class ContratoCredito {
        +valor
        +parcelas
        +taxaJurosMensal
    }

    Usuario <|-- Cliente
    Usuario <|-- Agente
    Agente <|-- Empresa
    Agente <|-- Banco
    Cliente "1" *-- "0..3" EntidadeEmpregadora
    Cliente "1" --> "0..*" Pedido : solicita
    Pedido "0..*" --> "1" Automovel : aluga
    Agente "1" --> "0..*" Pedido : avalia
    Pedido "1" *-- "0..1" Parecer
    Pedido "1" --> "0..1" Contrato : origina
    Contrato "1" *-- "0..1" ContratoCredito
    Banco "1" --> "0..*" ContratoCredito : concede
    Automovel "0..*" --> "0..1" Usuario : pertence a
```

## Estados do Pedido

```mermaid
stateDiagram-v2
    [*] --> PENDENTE
    PENDENTE --> EM_ANALISE
    EM_ANALISE --> APROVADO
    EM_ANALISE --> REPROVADO
    APROVADO --> CONTRATADO
    PENDENTE --> CANCELADO
    EM_ANALISE --> CANCELADO
    APROVADO --> CANCELADO
    REPROVADO --> [*]
    CONTRATADO --> [*]
    CANCELADO --> [*]
```
