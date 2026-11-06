import { readFileSync } from 'node:fs';
import { criarApi } from '../servidor/api.js';

const dados = JSON.parse(readFileSync(new URL('../db.json', import.meta.url), 'utf8'));
const app = criarApi(dados);

// Os dados vivem em memória por instância e voltam ao db.json em cold start.
export default (req, res) => app.handler(req, res);
