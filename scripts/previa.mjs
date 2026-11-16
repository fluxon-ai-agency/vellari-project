/* Prévia do site para o link do claude.ai (artifact).
   Gera previa/ (fora do git): build com caminhos relativos, só WebP, sem o mapa do Google
   (bloqueado no claude.ai), sem .htaccess/sitemap e com noindex.

   Uso: npm run previa
*/
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SAIDA = join(raiz, 'previa');

execSync('npx vite build --base ./ --outDir previa --emptyOutDir', { cwd: raiz, stdio: 'inherit' });

// Arquivos que não servem na prévia
for (const nome of ['.htaccess', 'sitemap.xml']) rmSync(join(SAIDA, nome), { force: true });

// Só WebP: apaga os AVIF
function arquivos(pasta) {
  return readdirSync(pasta).flatMap((n) => {
    const p = join(pasta, n);
    return statSync(p).isDirectory() ? arquivos(p) : [p];
  });
}
let avif = 0;
for (const p of arquivos(join(SAIDA, 'img'))) if (p.endsWith('.avif')) { rmSync(p); avif++; }

// HTML: noindex, sem <source> AVIF, sem o mapa e com caminhos de imagem relativos
const html = join(SAIDA, 'index.html');
let h = readFileSync(html, 'utf8');
h = h.replace(/<meta name="robots" content="[^"]*">/, '<meta name="robots" content="noindex, nofollow">');
h = h.replace(/<title>[^<]*<\/title>/, '<title>Prévia Vellari Phone</title>');
h = h.replace(/<source type="image\/avif"[^>]*>/g, '');
h = h.replace(/(<div[^>]*id="mapa"[^>]*?)\s+data-src="[^"]*"/, '$1');
h = h.replace(/(src|srcset|href|content)="\/(img|static|og-vellari|icon-|favicon|apple-touch|site\.webmanifest)/g, '$1="./$2');
h = h.replace(/, \/img\//g, ', ./img/');
writeFileSync(html, h);

// JS: o pôster do hero troca de cor com caminho absoluto; na prévia fica relativo
for (const p of arquivos(join(SAIDA, 'static'))) {
  if (!p.endsWith('.js')) continue;
  const js = readFileSync(p, 'utf8');
  const novo = js.replaceAll('`/img/hero/', '`./img/hero/');
  if (novo !== js) writeFileSync(p, novo);
}

const todos = arquivos(SAIDA);
const restoAbsoluto = (h.match(/="\/(?!\/)[^"]*/g) ?? []).filter((s) => !s.startsWith('="/#'));
console.log(`Prévia em previa/: ${todos.length} arquivos, ${(todos.reduce((s, p) => s + statSync(p).size, 0) / 1048576).toFixed(1)} MB; ${avif} AVIF removidos.`);
if (restoAbsoluto.length) console.log('Atenção, caminhos absolutos que sobraram:', [...new Set(restoAbsoluto)].slice(0, 10));
if (!existsSync(join(SAIDA, 'index.html'))) process.exit(1);
