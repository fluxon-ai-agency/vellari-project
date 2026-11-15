/* Rastreamento opcional (GA4 e Meta Pixel), em conformidade com a LGPD:
   só carrega se o ID estiver preenchido em store.ts E o visitante aceitar os cookies.
   Sem ID, nada é carregado e o banner nem aparece. */
import { store } from '../data/store.ts';

type Janela = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  fbq?: ((...args: unknown[]) => void) & { queue?: unknown[]; loaded?: boolean; version?: string; callMethod?: (...a: unknown[]) => void };
  _fbq?: unknown;
};
const w = window as Janela;
const CHAVE = 'vellari-cookies';
const { ga4Id, metaPixelId } = store.rastreamento;
let carregado = false;

function lerEscolha(): string | null {
  try {
    return localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

function script(src: string): void {
  const s = document.createElement('script');
  s.async = true;
  s.src = src;
  document.head.append(s);
}

function carregar(): void {
  if (carregado) return;
  carregado = true;
  if (ga4Id) {
    w.dataLayer = w.dataLayer ?? [];
    w.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments);
    };
    w.gtag('js', new Date());
    w.gtag('config', ga4Id);
    script(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`);
  }
  if (metaPixelId) {
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue!.push(args);
    } as NonNullable<Janela['fbq']>;
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = '2.0';
    w.fbq = fbq;
    w._fbq = fbq;
    script('https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', metaPixelId);
    fbq('track', 'PageView');
  }
}

/** Evento de lead: disparado em todo clique de WhatsApp, com a origem e o produto. */
export function lead(dados: { origem: string; local: string; produto?: string; cor?: string }): void {
  if (!carregado) return;
  w.gtag?.('event', 'generate_lead', { metodo: 'whatsapp', origem: dados.origem, local: dados.local, produto: dados.produto ?? '', cor: dados.cor ?? '' });
  w.fbq?.('track', 'Lead', { content_category: dados.origem, content_name: dados.produto ?? dados.local });
}

export function initRastreamento(): void {
  // Todo link de WhatsApp tem data-wa (origem), data-wa-local e, se for o caso, data-wa-produto
  document.addEventListener('click', (e) => {
    const link = (e.target as Element).closest<HTMLAnchorElement>('a[data-wa]');
    if (!link) return;
    lead({ origem: link.dataset.wa ?? '', local: link.dataset.waLocal ?? '', produto: link.dataset.waProduto, cor: link.dataset.waCor });
  });

  if (!ga4Id && !metaPixelId) return; // nada a carregar: sem banner
  const banner = document.getElementById('cookies');
  const escolha = lerEscolha();
  if (escolha === 'aceito') carregar();
  else if (escolha !== 'recusado' && banner) {
    banner.hidden = false;
    banner.addEventListener('click', (e) => {
      const botao = (e.target as Element).closest<HTMLButtonElement>('[data-cookies]');
      if (!botao) return;
      try {
        localStorage.setItem(CHAVE, botao.dataset.cookies ?? 'recusado');
      } catch {
        /* sem armazenamento: vale só para esta visita */
      }
      banner.hidden = true;
      if (botao.dataset.cookies === 'aceito') carregar();
    });
  }
}
