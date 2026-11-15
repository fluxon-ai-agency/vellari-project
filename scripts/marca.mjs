/* Gera os arquivos de marca em public/: favicon, ícones, manifest e a imagem de prévia
   (Open Graph, 1200x630) que aparece ao compartilhar o link no WhatsApp.
   Fontes: os logos oficiais da raiz e o render do hero. Os originais não são alterados.

   Uso: npm run marca */
import { existsSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pub = (nome) => join(raiz, 'public', nome);
const LOGO_PRETO = join(raiz, 'Vellari Phone Blue Logo.png'); // logo completo em fundo preto
const LOGO_BRANCO = join(raiz, 'vellari-logo-branco-transparente.png'); // para fundo escuro

/* ---------- Ícones: o "A" azul do logo ---------- */
const letraA = () =>
  sharp(LOGO_PRETO)
    .extract({ left: 763, top: 424, width: 194, height: 194 })
    .extend({ top: 30, bottom: 30, left: 30, right: 30, background: '#000000' });
for (const [nome, tamanho] of [['favicon.png', 48], ['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  await letraA().resize(tamanho, tamanho).png({ compressionLevel: 9 }).toFile(pub(nome));
}

/* ---------- Manifest ---------- */
writeFileSync(
  pub('site.webmanifest'),
  JSON.stringify(
    {
      name: 'Vellari Phone',
      short_name: 'Vellari',
      description: 'Loja de iPhone em Santa Fé do Sul - SP',
      lang: 'pt-BR',
      start_url: '/',
      display: 'browser',
      background_color: '#050505',
      theme_color: '#050505',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2,
  ) + '\n',
);

/* ---------- Imagem de prévia 1200x630 ---------- */
// À direita vai o render do nosso modelo 3D (o mesmo do hero), que não tem o logo da Apple.
const POSTER = join(raiz, 'public/img/hero/poster-bordo-1024.webp');
if (!existsSync(POSTER)) throw new Error('Rode "npm run poster" antes: falta public/img/hero/poster-bordo-1024.webp');
const aparelho = await sharp(POSTER).resize(630, 630).png().toBuffer();
const logo = await sharp(LOGO_BRANCO).resize({ width: 440 }).toBuffer();
const fundo = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g" cx="24%" cy="46%" r="62%"><stop offset="0" stop-color="#074DFF" stop-opacity=".30"/><stop offset="1" stop-color="#074DFF" stop-opacity="0"/></radialGradient>
    <radialGradient id="h" cx="76%" cy="50%" r="34%"><stop offset="0" stop-color="#074DFF" stop-opacity=".55"/><stop offset="1" stop-color="#074DFF" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#050505"/><rect width="1200" height="630" fill="url(#g)"/><rect width="1200" height="630" fill="url(#h)"/>
  <text x="70" y="452" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="700" fill="#FFFFFF">Loja de iPhone em</text>
  <text x="70" y="504" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="700" fill="#3F7BFF">Santa Fé do Sul - SP</text>
  <text x="70" y="560" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#FFFFFF" fill-opacity=".72">Garantia · Até 18x no cartão (com juros)</text>
</svg>`);
await sharp(fundo)
  .composite([
    { input: aparelho, left: 590, top: 0 },
    { input: logo, left: 60, top: 96 },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(pub('og-vellari.jpg'));

console.log('Marca: favicon.png, apple-touch-icon.png, icon-192.png, icon-512.png, site.webmanifest e og-vellari.jpg em public/');
