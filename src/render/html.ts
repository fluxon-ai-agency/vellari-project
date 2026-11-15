/* Utilitários de HTML usados no build (plugin do Vite) e no navegador.
   Funções puras: sem DOM e sem importar CSS. */
import manifesto from '../generated/images.json' with { type: 'json' };

interface Variante { w: number; src: string }
interface Imagem { alt: string; largura: number; altura: number; avif: Variante[]; webp: Variante[] }
const IMAGENS = manifesto as unknown as Record<string, Imagem>;

export function esc(s: unknown): string {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}

/** <svg> que aponta para um símbolo do sprite de ícones. */
export function icone(nome: string, classe = 'ic'): string {
  return `<svg class="${classe}" aria-hidden="true" focusable="false"><use href="#i-${nome}"/></svg>`;
}

export function temImagem(id: string): boolean {
  return id in IMAGENS;
}

interface OpcoesPicture {
  /** Atributo sizes: quanto da tela a imagem ocupa. */
  sizes: string;
  alt?: string;
  classe?: string;
  /** true só para a imagem do LCP. */
  prioridade?: boolean;
  /** 'ja' = sem lazy loading e sem disputar prioridade com a imagem do LCP (ex.: logo do topo). */
  carregar?: 'ja';
}

/** <picture> com AVIF + WebP, srcset, sizes, largura e altura (evita CLS). */
export function picture(id: string, o: OpcoesPicture): string {
  const img = IMAGENS[id];
  if (!img) throw new Error(`Imagem "${id}" não está em src/generated/images.json. Rode "npm run images".`);
  const srcset = (v: Variante[]) => v.map((x) => `${x.src} ${x.w}w`).join(', ');
  const ultima = img.webp[img.webp.length - 1];
  const carga = o.prioridade ? 'fetchpriority="high" decoding="async"' : o.carregar === 'ja' ? 'decoding="async"' : 'loading="lazy" decoding="async"';
  return `<picture${o.classe ? ` class="${o.classe}"` : ''}>
    <source type="image/avif" srcset="${srcset(img.avif)}" sizes="${o.sizes}">
    <source type="image/webp" srcset="${srcset(img.webp)}" sizes="${o.sizes}">
    <img src="${ultima?.src ?? ''}" alt="${esc(o.alt ?? img.alt)}" width="${img.largura}" height="${img.altura}" ${carga}>
  </picture>`;
}
