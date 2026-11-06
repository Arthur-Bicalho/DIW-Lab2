import { cpSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(raiz, 'dist');
const modo = process.env.ARMAZENAMENTO === 'local' ? 'local' : 'api';

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const pasta of ['public', 'src']) {
  cpSync(join(raiz, pasta), join(dist, pasta), { recursive: true });
}

// No modo local os dados ficam no navegador e db.json serve de semente.
if (modo === 'local') {
  writeFileSync(join(dist, 'src', 'shared', 'modo.js'), "export const ARMAZENAMENTO = 'local';\n");
  cpSync(join(raiz, 'db.json'), join(dist, 'db.json'));
}

console.log(`Build concluido em dist/ (public e src), modo de armazenamento: ${modo}.`);
