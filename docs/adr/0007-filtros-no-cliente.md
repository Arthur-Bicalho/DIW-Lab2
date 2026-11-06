# Filtros aplicados no cliente

Status: aceita

No JSON Server v1, `GET /pedidos?clienteId=1` não retorna registros cujo `clienteId` é o texto "1", porque o valor da consulta é interpretado como número. Ids e chaves estrangeiras continuam em texto (formato que o próprio JSON Server gera) e `recurso.listar` busca a coleção e filtra em JavaScript. Alternativa descartada: ids numéricos, pois os registros criados pela API recebem ids em texto e misturariam os tipos. O custo é baixar a coleção inteira, aceitável para um protótipo com poucos registros.
