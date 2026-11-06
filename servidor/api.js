import { createApp } from 'json-server/lib/app.js';

// O Service do JSON Server usa apenas `data` e `write()` do banco, então um
// objeto simples basta para manter tudo em memória (sem tocar em disco).
export function criarApi(dados) {
  const banco = {
    data: structuredClone(dados),
    read: async () => {},
    write: async () => {},
  };
  return createApp(banco);
}
