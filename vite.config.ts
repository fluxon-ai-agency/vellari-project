import { defineConfig, type Plugin } from 'vite';
import { robotsTxt, sitemapXml } from './src/render/seo.ts';
import { renderSlots } from './src/render/slots.ts';

/** Troca cada <!-- slot:nome --> do index.html pelo HTML gerado a partir de src/data.
    Assim o conteúdo já sai pronto no HTML (SEO e LCP não dependem de JavaScript). */
function prerender(): Plugin {
  return {
    name: 'vellari-prerender',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const slots = renderSlots();
        return html.replace(/<!--\s*slot:([\w-]+)\s*-->/g, (_, nome: string) => {
          const conteudo = slots[nome];
          if (conteudo === undefined) throw new Error(`Slot desconhecido no index.html: ${nome}`);
          return conteudo;
        });
      },
    },
  };
}

/** No build: pré-carrega a fonte principal (LCP mais rápido) e emite robots.txt e sitemap.xml. */
function extrasDoBuild(): Plugin {
  return {
    name: 'vellari-extras',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const fonte = Object.keys(ctx.bundle ?? {}).find((arquivo) => /archivo-latin-wdth-normal.*\.woff2$/.test(arquivo));
        if (!fonte) return html;
        return html.replace('</title>', `</title>\n<link rel="preload" href="/${fonte}" as="font" type="font/woff2" crossorigin>`);
      },
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt() });
      const sitemap = sitemapXml(new Date().toISOString().slice(0, 10));
      if (sitemap) this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
    },
  };
}

export default defineConfig({
  plugins: [prerender(), extrasDoBuild()],
  server: {
    // assets/ tem 1 GB de originais: não precisa ser vigiada
    watch: { ignored: ['**/assets/**', '**/docs/**'] },
  },
  // O Three.js entra só por import() dinâmico. Declarar aqui evita que o servidor de
  // desenvolvimento o descubra no meio da navegação e recarregue a página.
  optimizeDeps: {
    include: ['three', 'three/addons/environments/RoomEnvironment.js', 'three/addons/utils/BufferGeometryUtils.js'],
  },
  build: {
    target: 'es2020',
    // "static" para não confundir com a pasta assets/ dos originais
    assetsDir: 'static',
  },
});
