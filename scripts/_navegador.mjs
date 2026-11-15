/* Apoio dos scripts que precisam de um navegador: sobe o Vite e abre o Chrome instalado
   (playwright-core, sem baixar navegador). */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { createServer } from 'vite';

export const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export async function abrir({ porta = 5199 } = {}) {
  // cacheDir próprio: pode rodar ao mesmo tempo que "npm run dev" sem um atrapalhar o outro
  const servidor = await createServer({
    root: raiz,
    logLevel: 'error',
    cacheDir: 'node_modules/.vite-scripts',
    server: { port: porta, strictPort: false },
  });
  await servidor.listen();
  const url = servidor.resolvedUrls?.local[0] ?? `http://localhost:${porta}/`;

  let navegador;
  const args = ['--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--use-angle=swiftshader'];
  for (const channel of ['chrome', 'msedge']) {
    try {
      navegador = await chromium.launch({ channel, headless: true, args });
      break;
    } catch {
      /* tenta o próximo */
    }
  }
  if (!navegador) {
    await servidor.close();
    throw new Error('Não encontrei o Chrome nem o Edge instalados.');
  }
  return {
    url,
    navegador,
    async fechar() {
      await navegador.close();
      await servidor.close();
    },
  };
}
