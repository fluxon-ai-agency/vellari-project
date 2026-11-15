import { hero, store } from '../../data/store.ts';
import { linkOrigem } from '../../lib/whatsapp.ts';
import { esc, icone } from '../../render/html.ts';
import { posterAlt, posterSrcset } from './poster.ts';

export function heroSection(): string {
  const cor = hero.cores.find((c) => c.id === hero.corInicial) ?? hero.cores[0];
  const sizes = '(min-width: 900px) 560px, 92vw';

  const amostras = hero.cores
    .map(
      (c) => `
        <label class="amostra" title="${esc(c.nome)}">
          <input type="radio" name="hero-cor" value="${c.id}"${c.id === cor.id ? ' checked' : ''}>
          <span style="--c:${c.hex}"></span><span class="sr-only">${esc(c.nome)}</span>
        </label>`,
    )
    .join('');

  const pontos = hero.hotspots
    .map(
      (h) => `
        <button class="hotspot" type="button" data-hotspot="${h.id}" aria-label="${esc(h.rotulo)}: ver detalhe" aria-expanded="false" aria-controls="hero-card">
          <span class="hotspot-ponto" aria-hidden="true">${icone('mais', 'ic ic-16')}</span>
          <span class="hotspot-rotulo">${esc(h.rotulo)}</span>
        </button>`,
    )
    .join('');

  return `
<section class="hero" id="inicio" aria-labelledby="titulo-hero">
  <div class="container hero-grid">
    <div class="hero-titulo">
      <h1 id="titulo-hero">
        <span class="selo-phone">Loja de iPhone em ${esc(store.endereco.cidade)}</span>
        <span class="t-display"><span class="hero-produto">${esc(hero.produto)},</span> <span class="destaque">novas conquistas.</span></span>
      </h1>
      <!-- Arco Vellari: um por tela, sempre subindo da esquerda para a direita -->
      <svg class="arco" viewBox="0 0 260 46" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="grad-arco" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="260" y2="0">
            <stop offset="0" stop-color="#0237C9"/><stop offset=".55" stop-color="#074DFF"/><stop offset="1" stop-color="#1E8CFF"/>
          </linearGradient>
        </defs>
        <path class="traco" pathLength="1" d="M6 40 C 80 42, 160 32, 240 11"/>
        <path class="ponta" d="M223 4.6 L240 11 L228.2 24.6"/>
      </svg>
    </div>

    <div class="hero-visual">
      <div class="hero-palco" id="hero-palco" data-estado="poster">
        <picture class="hero-poster" id="hero-poster">
          <source type="image/avif" srcset="${posterSrcset(cor.id, 'avif')}" sizes="${sizes}">
          <source type="image/webp" srcset="${posterSrcset(cor.id, 'webp')}" sizes="${sizes}">
          <img src="/img/hero/poster-${cor.id}-640.webp" alt="${esc(posterAlt(cor.nome))}" width="1024" height="1024" fetchpriority="high" decoding="async">
        </picture>
        <canvas class="hero-canvas" id="hero-canvas" tabindex="-1" aria-hidden="true"></canvas>
        <div class="hero-hotspots" id="hero-hotspots" hidden>${pontos}</div>
        <p class="hero-dica" id="hero-dica" hidden>${icone('girar', 'ic ic-16')}Arraste para girar</p>
        <div class="hero-card" id="hero-card" role="status" hidden>
          <div class="hero-card-texto">
            <strong id="hero-card-titulo"></strong>
            <p id="hero-card-descricao"></p>
          </div>
          <button class="btn-icone" type="button" id="hero-card-fechar" aria-label="Fechar detalhe">${icone('fechar')}</button>
        </div>
      </div>

      <div class="hero-cores" role="radiogroup" aria-labelledby="hero-cor-rotulo">
        <p class="hero-cor-rotulo" id="hero-cor-rotulo">Cor: <strong id="hero-cor-nome">${esc(cor.nome)}</strong></p>
        <div class="amostras">${amostras}</div>
      </div>

      <ul class="mini-confianca" aria-label="Condições da compra">
        ${hero.confianca.map((t) => `<li>${icone('check')}${esc(t)}</li>`).join('')}
      </ul>
    </div>

    <div class="hero-texto">
      <p class="lead">Tela de ${esc(hero.tela)}, chip A20 Pro e câmera Fusion de 48 MP com abertura variável. Lacrado, com 1 ano de garantia, aqui em ${esc(store.endereco.cidade)}.</p>
      <div class="hero-ctas">
        <a class="btn btn-primario btn-g" id="hero-cta" data-wa="hero" data-wa-local="hero" data-wa-produto="${esc(hero.produto)}" data-wa-cor="${esc(cor.nome)}"
           href="${linkOrigem('hero', { cor: cor.nome })}" target="_blank" rel="noopener">
          ${icone('whatsapp')}Quero o ${esc(hero.produto)}
        </a>
        <a class="btn btn-contorno btn-g" href="#vitrine">Ver vitrine</a>
      </div>
    </div>
  </div>
</section>`;
}
