import { readFileSync } from 'node:fs';
import { criarApi } from '../servidor/api.js';
import { restaurarUrl } from '../servidor/url.js';

const dados = JSON.parse(readFileSync(new URL('../db.json', import.meta.url), 'utf8'));
const app = criarApi(dados);

// Os dados vivem em memória por instância e voltam ao db.json em cold start.
// Os rewrites da Vercel anexam `recurso`/`resto` à query; removê-los antes do JSON Server.
export default (req, res) => {
  req.url = restaurarUrl(req.url);
  return app.handler(req, res);
};
