import { hero } from '../../data/store.ts';

/** Posters do hero: renders do nosso próprio modelo 3D, um por cor (npm run poster). */
export function posterSrcset(corId: string, formato: 'avif' | 'webp'): string {
  return [640, 1024].map((w) => `/img/hero/poster-${corId}-${w}.${formato} ${w}w`).join(', ');
}

export function posterAlt(corNome: string): string {
  return `${hero.produto} na cor ${corNome}, visto de trás`;
}
