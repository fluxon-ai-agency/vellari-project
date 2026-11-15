/* Conteúdo de cada <!-- slot:nome --> do index.html, gerado no build. */
import { header } from '../sections/header/template.ts';
import { heroSection } from '../sections/hero/template.ts';
import {
  beneficiosSection,
  clientesSection,
  ctaFinalSection,
  entregaSection,
  faqSection,
  flutuantes,
  instagramSection,
  lojaSection,
  rodape,
} from '../sections/pagina/template.ts';
import { maisVendidosSection, modalSection, vitrineSection } from '../sections/produtos/template.ts';
import { head } from './seo.ts';
import { sprite } from './sprite.ts';

export function renderSlots(): Record<string, string> {
  return {
    head: head(),
    sprite: sprite(),
    header: header(),
    // Ordem das seções da página
    conteudo: [
      heroSection(),
      beneficiosSection(),
      maisVendidosSection(),
      vitrineSection(),
      lojaSection(),
      clientesSection(),
      entregaSection(),
      instagramSection(),
      faqSection(),
      ctaFinalSection(),
    ].join('\n'),
    rodape: rodape(),
    flutuantes: `${flutuantes()}\n${modalSection()}`,
  };
}
