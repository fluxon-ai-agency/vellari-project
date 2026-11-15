import { store } from '../../data/store.ts';
import { linkOrigem } from '../../lib/whatsapp.ts';
import { icone, picture } from '../../render/html.ts';

const MENU = [
  { rotulo: 'iPhones', href: '#mais-vendidos' },
  { rotulo: 'Vitrine', href: '#vitrine' },
  { rotulo: 'Loja', href: '#loja' },
  { rotulo: 'Contato', href: '#contato' },
];

export function header(): string {
  const whats = linkOrigem('geral');
  return `
<header class="topo" id="topo">
  <div class="container topo-inner">
    <a class="logo" href="#inicio" aria-label="${store.nome}, voltar ao início">
      ${picture('logo-vellari', { sizes: '120px', alt: store.nome, carregar: 'ja' })}
    </a>
    <nav class="nav" aria-label="Principal">
      ${MENU.map((m) => `<a href="${m.href}">${m.rotulo}</a>`).join('')}
    </nav>
    <div class="topo-acoes">
      <a class="btn btn-primario btn-p btn-whats" data-wa="geral" data-wa-local="cabecalho" href="${whats}" target="_blank" rel="noopener">
        ${icone('whatsapp')}<span>WhatsApp</span>
      </a>
      <button class="btn-icone btn-menu" type="button" id="botao-menu" aria-expanded="false" aria-controls="menu-mobile" aria-label="Abrir menu">
        ${icone('menu')}
      </button>
    </div>
  </div>
  <nav class="menu-mobile" id="menu-mobile" aria-label="Menu" hidden>
    <div class="container">
      ${MENU.map((m) => `<a class="link-menu" href="${m.href}">${m.rotulo} ${icone('seta-direita', 'ic ic-20')}</a>`).join('')}
      <a class="btn btn-primario btn-g btn-bloco" data-wa="geral" data-wa-local="menu" href="${whats}" target="_blank" rel="noopener">
        ${icone('whatsapp')}Falar no WhatsApp
      </a>
    </div>
  </nav>
</header>`;
}
