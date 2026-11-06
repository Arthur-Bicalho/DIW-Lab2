# Login simulado e permissões por perfil

Status: aceita

Os Usuários ficam no db.json com senha em texto puro e a sessão no sessionStorage; não é autenticação real e isso é declarado no README. Permissões são funções puras sobre o perfil (CLIENTE, EMPRESA, BANCO) e o Pedido, testáveis sem DOM. O Cliente só edita Pedido PENDENTE próprio; o JSON Server não impõe autorização, por isso o controle existe só na interface, o que basta para um protótipo acadêmico.
