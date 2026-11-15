/* <head>: SEO local, Open Graph, Twitter Card e dados estruturados (schema.org). */
import { garantiaDe, PRODUTOS } from '../data/products.ts';
import { store } from '../data/store.ts';
import { FAQ } from '../sections/pagina/template.ts';
import { esc } from './html.ts';

const e = store.endereco;
const cidadeUf = `${e.cidade} - ${e.uf}`;

export const TITULO = `${store.nome} | Loja de iPhone em ${cidadeUf}`;
export const DESCRICAO = `Loja de iPhone em ${cidadeUf}. iPhones lacrados com 1 ano de garantia e seminovos com 3 meses, em até 18x no cartão (com juros). Entregamos na região. Chama no WhatsApp.`;

/** URL absoluta, quando o domínio já foi definido em store.ts. */
const absoluta = (caminho: string) => (store.dominio ? `${store.dominio.replace(/\/$/, '')}${caminho}` : null);

const jsonLd = (dados: unknown) => `<script type="application/ld+json">${JSON.stringify(dados).replace(/</g, '\\u003c')}</script>`;

function loja(): Record<string, unknown> {
  const rua = e.numero ? `${e.rua}, ${e.numero}` : e.rua;
  const dias = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dados: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'MobilePhoneStore',
    name: store.nome,
    description: store.descricao,
    telephone: store.whatsapp.internacional,
    email: store.email,
    taxID: store.cnpj,
    address: {
      '@type': 'PostalAddress',
      streetAddress: [rua, e.complemento, e.bairro].filter(Boolean).join(', '),
      addressLocality: e.cidade,
      addressRegion: e.uf,
      postalCode: e.cep,
      addressCountry: e.pais,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: store.horario.diasAbertos.map((d) => dias[d]),
        opens: store.horario.abre,
        closes: store.horario.fecha,
      },
    ],
    openingHours: 'Mo-Sa 08:00-18:00',
    paymentAccepted: store.pagamento.formas.join(', '),
    currenciesAccepted: 'BRL',
    areaServed: store.entrega.cidades.map((nome) => ({ '@type': 'City', name: nome })),
    sameAs: [store.instagram.url],
  };
  const url = absoluta('/');
  if (url) {
    dados.url = url;
    dados.image = absoluta('/og-vellari.jpg');
    dados.logo = absoluta('/icon-512.png');
  }
  return dados;
}

/** Product só para itens com preço definido (regra do briefing). */
function produtos(): Array<Record<string, unknown>> {
  return PRODUTOS.filter((p) => typeof p.preco === 'number').map((p) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: [p.nome, p.armazenamento, p.cor].filter(Boolean).join(' '),
    category: p.categoria,
    itemCondition: p.condicao === 'Lacrado' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
    ...(garantiaDe(p) ? { description: `${p.condicao}, com ${garantiaDe(p)}.` } : {}),
    offers: {
      '@type': 'Offer',
      price: p.preco,
      priceCurrency: 'BRL',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'MobilePhoneStore', name: store.nome },
    },
  }));
}

function faq(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.pergunta, acceptedAnswer: { '@type': 'Answer', text: f.resposta } })),
  };
}

export function head(): string {
  const url = absoluta('/');
  const imagem = absoluta('/og-vellari.jpg');
  return `<title>${esc(TITULO)}</title>
<meta name="description" content="${esc(DESCRICAO)}">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#050505">
<meta name="geo.region" content="BR-${e.uf}">
<meta name="geo.placename" content="${esc(e.cidade)}">
${url ? `<link rel="canonical" href="${url}">` : ''}
<link rel="icon" href="/favicon.png" type="image/png" sizes="48x48">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="${esc(store.nome)}">
<meta property="og:title" content="${esc(`${store.nome} · Loja de iPhone em ${e.cidade}`)}">
<meta property="og:description" content="${esc(DESCRICAO)}">
${url ? `<meta property="og:url" content="${url}">` : ''}
${imagem ? `<meta property="og:image" content="${imagem}">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta property="og:image:alt" content="${esc(`${store.nome}, loja de iPhone em ${cidadeUf}`)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(TITULO)}">
<meta name="twitter:description" content="${esc(DESCRICAO)}">
${imagem ? `<meta name="twitter:image" content="${imagem}">` : ''}
${jsonLd(loja())}
${jsonLd(faq())}
${produtos().map(jsonLd).join('\n')}`;
}

/** robots.txt e sitemap.xml, emitidos no build. O sitemap precisa do domínio. */
export function robotsTxt(): string {
  const sitemap = absoluta('/sitemap.xml');
  return `User-agent: *\nAllow: /\n${sitemap ? `\nSitemap: ${sitemap}\n` : ''}`;
}
export function sitemapXml(hoje: string): string | null {
  const url = absoluta('/');
  if (!url) return null;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${url}</loc><lastmod>${hoje}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>\n</urlset>\n`;
}
