/* Pipeline de imagens.
   Lê src/data/image-sources.json, recorta e gera AVIF + WebP em várias larguras
   em public/img/. Os originais (assets/ e logos da raiz) nunca são alterados.

   Uso:
     npm run images                 gera o que mudou
     npm run images -- --force      gera tudo de novo
     npm run images -- --preview caminho.jpg   folha com todos os recortes, para conferir
*/
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const FONTES = join(raiz, 'src/data/image-sources.json');
const SAIDA = join(raiz, 'public/img');
const MANIFESTO = join(raiz, 'src/generated/images.json');
const LARGURAS = [320, 480, 640, 960, 1280];

const args = process.argv.slice(2);
const forcar = args.includes('--force');
const iPreview = args.indexOf('--preview');
const preview = iPreview >= 0 ? resolve(args[iPreview + 1]) : null;

const { imagens } = JSON.parse(readFileSync(FONTES, 'utf8'));
const anterior = existsSync(MANIFESTO) ? JSON.parse(readFileSync(MANIFESTO, 'utf8')) : {};
mkdirSync(SAIDA, { recursive: true });
mkdirSync(dirname(MANIFESTO), { recursive: true });

async function recortar(def) {
  const origem = join(raiz, def.src);
  if (!existsSync(origem)) throw new Error(`Original não encontrado: ${def.src}`);
  const meta = await sharp(origem).metadata();
  let area = { left: 0, top: 0, width: meta.width, height: meta.height };
  if (def.recorte) {
    const [x, y, w, h] = def.recorte;
    const left = Math.round(x * meta.width);
    const top = Math.round(y * meta.height);
    area = {
      left,
      top,
      width: Math.min(Math.round(w * meta.width), meta.width - left),
      height: Math.min(Math.round(h * meta.height), meta.height - top),
    };
  }
  return { origem, area };
}

const manifesto = {};
let geradas = 0;
let reaproveitadas = 0;
const quadros = [];

let semOriginal = 0;
for (const [id, def] of Object.entries(imagens)) {
  // Original fora desta máquina (assets/media/ não vai para o git): reaproveita o que já foi
  // gerado, desde que a definição não tenha mudado e os arquivos estejam em public/img/.
  if (!existsSync(join(raiz, def.src)) && anterior[id]?.fonte === JSON.stringify([def.src, def.recorte, def.larguras ?? null])) {
    const salvo = anterior[id];
    if ([...salvo.avif, ...salvo.webp].every((f) => existsSync(join(raiz, 'public', f.src)))) {
      manifesto[id] = { ...salvo, alt: def.alt ?? salvo.alt };
      semOriginal++;
      continue;
    }
  }
  const { origem, area } = await recortar(def);
  const assinatura = createHash('sha1')
    .update(JSON.stringify([def.src, def.recorte, def.larguras ?? LARGURAS, statSync(origem).size, statSync(origem).mtimeMs]))
    .digest('hex')
    .slice(0, 12);

  const larguras = (def.larguras ?? LARGURAS).filter((w) => w <= area.width);
  if (larguras.length === 0) larguras.push(area.width);
  const proporcao = area.height / area.width;
  const item = {
    alt: def.alt ?? '',
    largura: larguras.at(-1),
    altura: Math.round(larguras.at(-1) * proporcao),
    assinatura,
    fonte: JSON.stringify([def.src, def.recorte, def.larguras ?? null]),
    avif: larguras.map((w) => ({ w, src: `/img/${id}-${w}.avif` })),
    webp: larguras.map((w) => ({ w, src: `/img/${id}-${w}.webp` })),
  };
  manifesto[id] = item;

  const base = () => sharp(origem).extract(area);
  if (preview) {
    quadros.push({ id, buffer: await base().resize(300, 300, { fit: 'contain', background: '#222' }).jpeg({ quality: 78 }).toBuffer() });
  }

  const pronto = !forcar && anterior[id]?.assinatura === assinatura && [...item.avif, ...item.webp].every((f) => existsSync(join(raiz, 'public', f.src)));
  if (pronto) { reaproveitadas++; continue; }

  for (const w of larguras) {
    const r = base().resize({ width: w });
    await r.clone().avif({ quality: def.alfa ? 62 : 52, effort: 5 }).toFile(join(SAIDA, `${id}-${w}.avif`));
    await r.clone().webp({ quality: def.alfa ? 86 : 78, effort: 5 }).toFile(join(SAIDA, `${id}-${w}.webp`));
  }
  geradas++;
}

writeFileSync(MANIFESTO, JSON.stringify(manifesto, null, 2) + '\n');
console.log(`Imagens: ${geradas} geradas, ${reaproveitadas} reaproveitadas${semOriginal ? `, ${semOriginal} sem o original nesta máquina (mantidas como estavam)` : ''}. Manifesto: src/generated/images.json`);

if (preview) {
  const colunas = 6;
  const linhas = Math.ceil(quadros.length / colunas);
  const rotulo = (id, i) => ({
    input: Buffer.from(`<svg width="300" height="22" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="22" fill="#000"/><text x="6" y="16" font-family="Consolas, monospace" font-size="13" fill="#fff">${id}</text></svg>`),
    left: (i % colunas) * 300,
    top: Math.floor(i / colunas) * 322,
  });
  await sharp({ create: { width: colunas * 300, height: linhas * 322, channels: 3, background: '#111' } })
    .composite(quadros.flatMap((q, i) => [rotulo(q.id, i), { input: q.buffer, left: (i % colunas) * 300, top: Math.floor(i / colunas) * 322 + 22 }]))
    .jpeg({ quality: 80 })
    .toFile(preview);
  console.log(`Folha de conferência: ${preview}`);
}
