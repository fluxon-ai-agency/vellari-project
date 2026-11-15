import './hero.css';
import { hero, type CorHero } from '../../data/store.ts';
import { linkOrigem } from '../../lib/whatsapp.ts';
import type { Hero3D } from '../../three/cena.ts';
import { posterAlt, posterSrcset } from './poster.ts';

const porId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T | null;

/** WebGL com placa de vídeo de verdade. Com render por software (sem GPU) o 3D travaria a
    página, então o navegador recusa o contexto e o site fica no poster. */
function temWebGL(aceitarSemGpu: boolean): boolean {
  try {
    const c = document.createElement('canvas');
    const opcoes = { failIfMajorPerformanceCaveat: !aceitarSemGpu };
    const gl = (c.getContext('webgl2', opcoes) || c.getContext('webgl', opcoes)) as WebGLRenderingContext | null;
    if (!gl) return false;
    if (aceitarSemGpu) return true;
    // Alguns navegadores entregam um contexto por software sem avisar: confere o nome do renderizador
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const renderizador = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
    return !/swiftshader|llvmpipe|software|basic render/i.test(renderizador);
  } catch {
    return false;
  }
}

export function initHero(): void {
  const palco = porId('hero-palco');
  const canvas = porId<HTMLCanvasElement>('hero-canvas');
  const poster = porId('hero-poster');
  const cta = porId<HTMLAnchorElement>('hero-cta');
  const nomeCor = porId('hero-cor-nome');
  const dica = porId('hero-dica');
  const caixaPontos = porId('hero-hotspots');
  const card = porId('hero-card');
  const cardTitulo = porId('hero-card-titulo');
  const cardDescricao = porId('hero-card-descricao');
  const cardFechar = porId('hero-card-fechar');
  if (!palco || !canvas || !poster || !cta) return;

  // Ferramenta de desenvolvimento: /?poster gera os posters a partir do modelo 3D
  if (import.meta.env.DEV && new URLSearchParams(location.search).has('poster')) {
    void modoPoster();
    return;
  }

  let cena: Hero3D | null = null;
  let aberto: string | null = null;
  const reduzirMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const radios = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="hero-cor"]'));
  const pontos: Record<string, HTMLButtonElement> = {};
  caixaPontos?.querySelectorAll<HTMLButtonElement>('[data-hotspot]').forEach((b) => {
    if (b.dataset.hotspot) pontos[b.dataset.hotspot] = b;
  });

  /* ---------- Seletor de cores ---------- */
  function aplicarCor(cor: CorHero): void {
    if (nomeCor) nomeCor.textContent = cor.nome;
    // A mensagem do WhatsApp leva a cor escolhida
    cta!.href = linkOrigem('hero', { cor: cor.nome });
    cta!.dataset.waCor = cor.nome;
    // Poster (também é o que aparece sem WebGL ou com "reduzir movimento")
    poster!.querySelectorAll('source').forEach((fonte) => {
      fonte.srcset = posterSrcset(cor.id, fonte.type === 'image/avif' ? 'avif' : 'webp');
    });
    const img = poster!.querySelector('img');
    if (img) {
      img.src = `/img/hero/poster-${cor.id}-640.webp`;
      img.alt = posterAlt(cor.nome);
    }
    cena?.definirCor(cor.hex);
  }
  const corAtual = (): CorHero => hero.cores.find((c) => c.id === radios.find((r) => r.checked)?.value) ?? hero.cores[0];
  radios.forEach((r) => r.addEventListener('change', () => aplicarCor(corAtual())));

  /* ---------- Hotspots ---------- */
  function fecharCard(devolverFoco = false): void {
    if (!aberto) return;
    const botao = pontos[aberto];
    botao?.setAttribute('aria-expanded', 'false');
    aberto = null;
    if (card) card.hidden = true;
    cena?.focar(null);
    if (devolverFoco) botao?.focus();
  }
  function abrirCard(id: string): void {
    const dados = hero.hotspots.find((h) => h.id === id);
    if (!dados || !card || !cardTitulo || !cardDescricao) return;
    if (aberto) pontos[aberto]?.setAttribute('aria-expanded', 'false');
    aberto = id;
    pontos[id]?.setAttribute('aria-expanded', 'true');
    cardTitulo.textContent = dados.titulo;
    cardDescricao.textContent = dados.texto;
    card.hidden = false;
    dica?.classList.add('sumir');
    cena?.focar(id);
  }
  Object.entries(pontos).forEach(([id, botao]) => {
    botao.addEventListener('click', () => (aberto === id ? fecharCard() : abrirCard(id)));
  });
  cardFechar?.addEventListener('click', () => fecharCard(true));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && aberto) fecharCard(true);
  });

  /* ---------- Rolagem: o aparelho gira um pouco e some suavemente ---------- */
  if (!reduzirMovimento) {
    let pendente = false;
    const aoRolar = () => {
      if (pendente) return;
      pendente = true;
      requestAnimationFrame(() => {
        pendente = false;
        const r = palco.getBoundingClientRect();
        // 0 enquanto o palco está inteiro na tela; 1 quando ele saiu por cima
        const p = Math.min(1, Math.max(0, (80 - r.top) / Math.max(r.height, 1)));
        palco.style.setProperty('--saida', p.toFixed(3));
        cena?.rolar(p);
      });
    };
    window.addEventListener('scroll', aoRolar, { passive: true });
  }

  /* ---------- 3D: só depois do poster, e só se fizer sentido ---------- */
  const conexao = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  // ?3d=1 liga o 3D mesmo sem placa de vídeo: usado só pelos testes automáticos
  const aceitarSemGpu = new URLSearchParams(location.search).get('3d') === '1';
  if (reduzirMovimento || conexao?.saveData) return; // fica o poster estático; o seletor de cores troca a imagem

  async function carregar3D(): Promise<void> {
    // Criar um contexto WebGL custa caro em aparelho fraco: a checagem só roda aqui, com a página já pronta
    const t0 = performance.now();
    const ok = temWebGL(aceitarSemGpu);
    performance.measure('vellari-3d:checar-webgl', { start: t0 });
    if (!ok) return;
    try {
      const t1 = performance.now();
      const { montarHero3D } = await import('../../three/cena.ts');
      performance.measure('vellari-3d:importar', { start: t1 });
      cena = await montarHero3D({
        palco: palco!,
        canvas: canvas!,
        cor: corAtual().hex,
        pontos,
        aceitarSemGpu,
        medir: import.meta.env.DEV && new URLSearchParams(location.search).has('medir3d'),
        aoInteragir() {
          dica?.classList.add('sumir'); // some depois da primeira interação
          if (aberto) fecharCard();
        },
        aoPerderContexto() {
          palco!.dataset.estado = 'poster';
        },
      });
      // Agora o canvas é interativo: entra na ordem do teclado, com descrição
      canvas!.tabIndex = 0;
      canvas!.removeAttribute('aria-hidden');
      canvas!.setAttribute('role', 'img');
      canvas!.setAttribute('aria-label', `${hero.produto} em 3D. Arraste ou use as setas para a esquerda e para a direita para girar.`);
      palco!.dataset.estado = '3d'; // troca o poster pelo 3D com fade
      if (caixaPontos) caixaPontos.hidden = false;
      if (dica) dica.hidden = false;
    } catch (erro) {
      console.warn('[Vellari] 3D indisponível, mantendo o poster.', erro);
      palco!.dataset.estado = 'poster';
    }
  }

  const agendar = () => {
    const ocioso = (window as Window & { requestIdleCallback?: (fn: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
    if (ocioso) ocioso(() => void carregar3D(), { timeout: 1500 });
    else setTimeout(() => void carregar3D(), 200);
  };
  if (document.readyState === 'complete') agendar();
  else window.addEventListener('load', agendar, { once: true });
}

/** Só em desenvolvimento: expõe window.__poster(hex) para scripts/hero-poster.mjs. */
async function modoPoster(): Promise<void> {
  const { montarHero3D } = await import('../../three/cena.ts');
  const canvas = document.createElement('canvas');
  const caixa = document.createElement('div');
  caixa.append(canvas);
  document.body.append(caixa);
  const cena = await montarHero3D({ palco: caixa, canvas, cor: hero.cores[0].hex, estatico: { tamanho: 1024 } });
  Object.assign(window, {
    __posterCores: hero.cores.map((c) => ({ id: c.id, hex: c.hex })),
    __poster: (hex: string) => {
      cena.definirCor(hex, true);
      return cena.capturar();
    },
  });
}
