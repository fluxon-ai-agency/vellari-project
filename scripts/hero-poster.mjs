/* Gera os posters do hero (um por cor) a partir do nosso próprio modelo 3D.
   O poster aparece antes do Three.js carregar (LCP rápido) e é o que fica
   sem WebGL ou com "reduzir movimento".

   Uso: npm run poster   (precisa do Chrome ou do Edge instalado) */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { abrir, raiz } from './_navegador.mjs';

const SAIDA = join(raiz, 'public/img/hero');
mkdirSync(SAIDA, { recursive: true });

const { url, navegador, fechar } = await abrir();
try {
  const pagina = await navegador.newPage({ viewport: { width: 1100, height: 1100 }, deviceScaleFactor: 1 });
  pagina.on('pageerror', (e) => console.error('[página]', e.message));
  await pagina.goto(`${url}?poster=1`);
  await pagina.waitForFunction(() => typeof window.__poster === 'function', null, { timeout: 60000 });
  const cores = await pagina.evaluate(() => window.__posterCores);

  for (const cor of cores) {
    const dataUrl = await pagina.evaluate((hex) => window.__poster(hex), cor.hex);
    const png = Buffer.from(dataUrl.split(',')[1], 'base64');
    for (const w of [640, 1024]) {
      const base = sharp(png).resize({ width: w });
      await base.clone().avif({ quality: 60, effort: 6 }).toFile(join(SAIDA, `poster-${cor.id}-${w}.avif`));
      await base.clone().webp({ quality: 84, effort: 6 }).toFile(join(SAIDA, `poster-${cor.id}-${w}.webp`));
    }
    console.log(`poster ${cor.id} (${cor.hex})`);
  }
} finally {
  await fechar();
}
console.log(`Posters em ${SAIDA}`);
