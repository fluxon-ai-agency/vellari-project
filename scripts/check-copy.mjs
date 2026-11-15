/* Checagem de textos no build: falha se algum texto proibido aparecer em dist/. */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
if (!existsSync(dist)) {
  console.error('dist/ não existe. Rode "vite build" antes.');
  process.exit(1);
}

const PROIBIDOS = [
  { padrao: /sem\s+juros/i, motivo: 'parcelamento é sempre "em até 18x (com juros)"' },
  { padrao: /revendedor[a]?\s+autorizad[ao]/i, motivo: 'a loja não é revendedora autorizada Apple' },
  { padrao: /rafa\s*imports/i, motivo: 'marca antiga' },
  { padrao: /\[(CONFIRMAR|N[ÚU]MERO|GA4_ID|PIXEL_ID)[^\]]*\]/i, motivo: 'placeholder com colchetes visível para o cliente' },
];

const arquivos = [];
(function andar(dir) {
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) andar(caminho);
    else if (['.html', '.js', '.css', '.json', '.xml', '.txt', '.webmanifest'].includes(extname(nome))) arquivos.push(caminho);
  }
})(dist);

let falhas = 0;
for (const arquivo of arquivos) {
  const texto = readFileSync(arquivo, 'utf8');
  for (const { padrao, motivo } of PROIBIDOS) {
    const achado = texto.match(padrao);
    if (achado) {
      falhas++;
      console.error(`✗ ${arquivo.slice(dist.length + 1)}: "${achado[0]}" (${motivo})`);
    }
  }
}

if (falhas) {
  console.error(`\n${falhas} texto(s) proibido(s) em dist/.`);
  process.exit(1);
}
console.log(`Textos conferidos em ${arquivos.length} arquivos: nenhum "sem juros", marca antiga ou placeholder visível.`);
