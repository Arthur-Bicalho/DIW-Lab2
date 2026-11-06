import { cpSync, rmSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(raiz, 'dist');

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const pasta of ['public', 'src']) {
  cpSync(join(raiz, pasta), join(dist, pasta), { recursive: true });
}

console.log('Build concluido em dist/ (public e src).');
