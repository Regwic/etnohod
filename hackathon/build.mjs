import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = new URL('../', import.meta.url);
const destination = resolve(process.argv[2] ?? 'outputs/hackathon');
const hosting = new URL('.openai/hosting.json', root);
const read = name => readFile(new URL('hackathon/' + name, root), 'utf8');
const [game, view, worker, image] = await Promise.all([
  read('game.mjs'), read('view.mjs'), read('worker.mjs'),
  readFile(new URL('dist/assets/family-table.webp', root)),
]);
const stripExports = module => module.replace(/^export const /gm, 'const ');
const bundle = [
  stripExports(game), stripExports(view),
  'const heroImage = ' + JSON.stringify(image.toString('base64')) + ';',
  worker.replace(/^import .*;\n/gm, ''),
].join('\n');

await mkdir(resolve(destination, 'dist/server'), { recursive: true });
await mkdir(resolve(destination, '.openai'), { recursive: true });
await mkdir(resolve(destination, 'hackathon/migrations'), { recursive: true });
await writeFile(resolve(destination, 'dist/server/index.js'), bundle);
await copyFile(hosting, resolve(destination, '.openai/hosting.json'));
await copyFile(new URL('hackathon/migrations/0000_hackathon.sql', root), resolve(destination, 'hackathon/migrations/0000_hackathon.sql'));
