/* Cena 3D do hero. Este módulo só é carregado com import() dinâmico,
   depois que o poster já apareceu (o Three.js não entra no bundle inicial). */
import {
  CanvasTexture,
  DirectionalLight,
  Group,
  Mesh,
  MeshBasicMaterial,
  NeutralToneMapping,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  Vector3,
  WebGLCubeRenderTarget,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { criarTelefone, DIM } from './telefone.ts';

export interface OpcoesHero3D {
  palco: HTMLElement;
  canvas: HTMLCanvasElement;
  /** Cor inicial (hex). */
  cor: string;
  /** Botões dos hotspots, por id. A cena só atualiza a posição deles. */
  pontos?: Record<string, HTMLElement>;
  /** Chamado a cada início de arrasto ou uso do teclado. */
  aoInteragir?: () => void;
  aoPerderContexto?: () => void;
  /** Modo poster: tamanho fixo, um quadro só, sem interação. */
  estatico?: { tamanho: number };
  /** Só para testes automáticos: liga o 3D mesmo sem placa de vídeo. */
  aceitarSemGpu?: boolean;
  /** Só em desenvolvimento (?medir3d): mede cada etapa da partida esperando a placa de vídeo. */
  medir?: boolean;
}

export interface Hero3D {
  definirCor(hex: string, imediato?: boolean): void;
  /** Aproxima a câmera de um hotspot; null volta ao enquadramento normal. */
  focar(id: string | null): void;
  /** Progresso da rolagem para fora do hero (0 a 1): o aparelho gira um pouco. */
  rolar(progresso: number): void;
  /** Desenha um quadro e devolve PNG em data URL (modo poster). */
  capturar(): string;
  destruir(): void;
}

/* Pose e ritmo */
export const POSE = { yaw: Math.PI - 0.52, pitch: 0.1 } as const; // traseira em três quartos, igual ao poster
const ELEVACAO = 0.1; // câmera um pouco acima, para a sombra de contato aparecer
const OCUPACAO = 0.8; // altura do aparelho em relação ao menor lado do palco
const FOV = 26;
const OLHAR_Y = -0.55;
const VEL_AUTO = 0.32; // rad/s
const PAUSA_AUTO = 5000; // ms sem interação até voltar a girar sozinho
const LIMITE_PITCH = 0.38; // limite do ângulo vertical
const DOIS_PI = Math.PI * 2;

function texturaSombra(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  if (g) {
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(0,0,0,.62)');
    r.addColorStop(0.45, 'rgba(0,0,0,.28)');
    r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
  }
  return new CanvasTexture(c);
}

export async function montarHero3D(o: OpcoesHero3D): Promise<Hero3D> {
  const { palco, canvas } = o;
  const estatico = o.estatico ?? null;
  const inicio = performance.now();

  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: Boolean(estatico),
    // Sem placa de vídeo (render por software) o 3D travaria a página: melhor ficar no poster
    failIfMajorPerformanceCaveat: !estatico && !o.aceitarSemGpu,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = NeutralToneMapping; // preserva o tom das cores do aparelho
  renderer.toneMappingExposure = 1;

  /* A partida é feita em etapas, devolvendo o controle ao navegador entre elas: assim a
     página continua respondendo a toque e rolagem enquanto o 3D é preparado. */
  const respirar = () => new Promise<void>((ok) => setTimeout(ok, 0));
  /* Marcas de tempo de cada etapa (aparecem no Lighthouse em "User Timing"). Com o.medir,
     espera a placa de vídeo terminar cada etapa, para o tempo ser atribuído à etapa certa. */
  const gl = renderer.getContext();
  let marco = inicio;
  const etapa = (nome: string) => {
    if (o.medir) gl.finish();
    const agora = performance.now();
    performance.measure(`vellari-3d:${nome}`, { start: marco, end: agora });
    marco = agora;
  };
  etapa('contexto');
  if (!estatico) await respirar();

  const scene = new Scene();
  // Iluminação de estúdio gerada em código (sem baixar HDR)
  const pmrem = new PMREMGenerator(renderer);
  const sala = new RoomEnvironment();
  if (!estatico) {
    // Compila em segundo plano os shaders da "sala" antes de fotografá-la. Eles são compilados
    // no estado de "desenhar em textura" (sem tone mapping), o mesmo que fromScene usa.
    const alvoTemporario = new WebGLCubeRenderTarget(16);
    renderer.setRenderTarget(alvoTemporario);
    const pronto = renderer.compileAsync(sala, new PerspectiveCamera(90, 1, 0.1, 100));
    renderer.setRenderTarget(null);
    await pronto;
    alvoTemporario.dispose();
    etapa('ambiente-shaders');
  }
  const ambiente = pmrem.fromScene(sala, 0.04);
  scene.environment = ambiente.texture;
  scene.environmentIntensity = 0.8;
  sala.dispose();
  pmrem.dispose();
  etapa('ambiente');
  if (!estatico) await respirar();
  // Luz principal e contraluz: desenham o brilho nas bordas de alumínio
  const principal = new DirectionalLight(0xffffff, 1.6);
  principal.position.set(7, 9, 12);
  const contraluz = new DirectionalLight(0xbfd4ff, 1.2);
  contraluz.position.set(-10, 5, -4);
  scene.add(principal, contraluz);

  const camera = new PerspectiveCamera(FOV, 1, 5, 200);

  const telefone = criarTelefone(o.cor);
  etapa('geometria');
  if (!estatico) await respirar();
  const inclinacao = new Group(); // pitch
  const giro = new Group(); // yaw
  giro.add(telefone.grupo);
  inclinacao.add(giro);
  scene.add(inclinacao);

  // Sombra de contato suave sob o aparelho (gira junto, não inclina)
  const mapaSombra = texturaSombra();
  const geoSombra = new PlaneGeometry(DIM.largura * 1.5, 4.6);
  geoSombra.rotateX(-Math.PI / 2);
  const matSombra = new MeshBasicMaterial({ map: mapaSombra, transparent: true, depthWrite: false, toneMapped: false });
  const sombra = new Mesh(geoSombra, matSombra);
  sombra.position.y = -(DIM.altura / 2 + 0.75);
  scene.add(sombra);

  /* ---------- Estado ---------- */
  const s = { yaw: POSE.yaw as number, pitch: POSE.pitch as number, vel: 0, auto: 0, zoom: 1, olharX: 0, olharY: OLHAR_Y, rolagem: 0 };
  const alvo = { yaw: null as number | null, zoom: 1, olharX: 0, olharY: OLHAR_Y };
  let foco: string | null = null;
  let arrastando = false;
  let ponteiro = -1;
  let ultimoX = 0;
  let ultimoY = 0;
  let ultimoT = 0;
  let ultimaInteracao = -Infinity; // gira sozinho até o primeiro toque
  let largura = 1;
  let altura = 1;
  let distancia = 40;
  let sujo = true;
  let dprMaximo = 2;

  function redimensionar(): void {
    largura = estatico ? estatico.tamanho : Math.max(palco.clientWidth, 1);
    altura = estatico ? estatico.tamanho : Math.max(palco.clientHeight, 1);
    renderer.setPixelRatio(estatico ? 1 : Math.min(window.devicePixelRatio || 1, dprMaximo)); // DPR limitado a 2
    renderer.setSize(largura, altura, false);
    camera.aspect = largura / altura;
    // O aparelho ocupa OCUPACAO do menor lado: assim poster e canvas ficam do mesmo tamanho
    const menor = Math.min(largura, altura);
    const alturaVisivel = (DIM.altura / OCUPACAO) * (altura / menor);
    distancia = alturaVisivel / (2 * Math.tan((FOV * Math.PI) / 360));
    camera.updateProjectionMatrix();
    sujo = true;
  }

  const v = new Vector3();
  const n = new Vector3();
  function posicionarPontos(): void {
    if (!o.pontos) return;
    for (const [id, el] of Object.entries(o.pontos)) {
      const a = telefone.ancoras[id];
      if (!a) continue;
      v.copy(a.pos).applyMatrix4(telefone.grupo.matrixWorld);
      n.copy(a.normal).transformDirection(telefone.grupo.matrixWorld);
      const deFrente = n.dot(camera.position.clone().sub(v).normalize()) > 0.18;
      v.project(camera);
      const x = (v.x * 0.5 + 0.5) * largura;
      const y = (-v.y * 0.5 + 0.5) * altura;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      const verso = deFrente ? '0' : '1';
      if (el.dataset.verso !== verso) el.dataset.verso = verso;
    }
  }

  function desenhar(): void {
    const yaw = s.yaw + s.rolagem * 0.7;
    giro.rotation.y = yaw;
    sombra.rotation.y = yaw;
    inclinacao.rotation.x = s.pitch;
    const d = distancia * s.zoom;
    camera.position.set(s.olharX, s.olharY + Math.sin(ELEVACAO) * d, Math.cos(ELEVACAO) * d);
    camera.lookAt(s.olharX, s.olharY, 0);
    scene.updateMatrixWorld();
    renderer.render(scene, camera);
    posicionarPontos();
  }

  const aproximar = (atual: number, destino: number, taxa: number, dt: number) => atual + (destino - atual) * (1 - Math.exp(-taxa * dt));

  /** Avança a animação. Devolve true se algo mudou e é preciso desenhar. */
  function atualizar(dt: number, agora: number): boolean {
    let mexeu = false;

    // Auto-rotação lenta: até o primeiro toque e depois de 5 s sem interação
    const querAuto = !economico && !arrastando && foco === null && agora - ultimaInteracao > PAUSA_AUTO;
    s.auto = aproximar(s.auto, querAuto ? VEL_AUTO : 0, 2.5, dt);
    if (Math.abs(s.auto) > 0.002) {
      s.yaw += s.auto * dt;
      mexeu = true;
    }

    // Inércia depois de soltar
    if (!arrastando && s.vel !== 0) {
      s.yaw += s.vel * dt;
      s.vel *= Math.exp(-3.4 * dt);
      if (Math.abs(s.vel) < 0.02) s.vel = 0;
      mexeu = true;
    }

    // Foco em um hotspot: gira até a face certa
    if (alvo.yaw !== null && Math.abs(alvo.yaw - s.yaw) > 0.002) {
      s.yaw = aproximar(s.yaw, alvo.yaw, 6, dt);
      mexeu = true;
    }

    // O ângulo vertical volta ao padrão quando o aparelho gira sozinho ou está em foco
    if ((querAuto || foco !== null) && Math.abs(s.pitch - POSE.pitch) > 0.002) {
      s.pitch = aproximar(s.pitch, POSE.pitch, 3, dt);
      mexeu = true;
    }

    for (const chave of ['zoom', 'olharX', 'olharY'] as const) {
      if (Math.abs(alvo[chave] - s[chave]) > 0.001) {
        s[chave] = aproximar(s[chave], alvo[chave], 5.5, dt);
        mexeu = true;
      }
    }

    if (telefone.atualizar(dt)) mexeu = true;
    return mexeu;
  }

  /* ---------- Laço de render: só roda com o hero na tela e a aba visível ---------- */
  let ativo = false;
  let naTela = true;
  let raf = 0;
  let ultimoQuadro = 0;

  /* Qualidade adaptativa. Meta: nenhum travamento ao rolar, mesmo em aparelho fraco.
     - Se não segura ~30 quadros por segundo, a resolução do canvas cai (2x, 1,5x, 1x).
     - Se mesmo em 1x os quadros passam de 50 ms, entra o modo econômico: o aparelho para de
       girar sozinho e só é redesenhado quando o visitante arrasta, troca a cor ou abre um ponto. */
  let amostras = 0;
  let somaQuadros = 0;
  let economico = false;
  function medir(intervalo: number): void {
    if (economico || intervalo > 400) return; // pausas (aba oculta, rolagem) não contam
    somaQuadros += intervalo;
    if (++amostras < 14) return;
    const media = somaQuadros / amostras;
    amostras = 0;
    somaQuadros = 0;
    if (media > 90 || (media > 50 && dprMaximo <= 1)) {
      economico = true;
      dprMaximo = 1;
      s.auto = 0;
      redimensionar();
    } else if (media > 34 && dprMaximo > 1) {
      dprMaximo = dprMaximo > 1.5 ? 1.5 : 1;
      redimensionar();
    }
  }

  function quadro(t: number): void {
    raf = 0;
    const intervalo = t - ultimoQuadro;
    const dt = Math.min(intervalo / 1000, 0.05);
    ultimoQuadro = t;
    if (atualizar(dt, t) || sujo) {
      desenhar();
      sujo = false;
      medir(intervalo);
    }
    if (ativo) raf = requestAnimationFrame(quadro);
  }
  function reavaliar(): void {
    const deveRodar = naTela && !document.hidden;
    if (deveRodar && !ativo) {
      ativo = true;
      ultimoQuadro = performance.now();
      raf = requestAnimationFrame(quadro);
    } else if (!deveRodar && ativo) {
      ativo = false;
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  /* ---------- Interação ---------- */
  const limpar: Array<() => void> = [];
  const ouvir = <K extends keyof HTMLElementEventMap>(el: HTMLElement, tipo: K, fn: (e: HTMLElementEventMap[K]) => void, opcoes?: AddEventListenerOptions) => {
    el.addEventListener(tipo, fn, opcoes);
    limpar.push(() => el.removeEventListener(tipo, fn, opcoes));
  };

  function interagiu(): void {
    ultimaInteracao = performance.now();
    o.aoInteragir?.();
  }

  function soltar(e: PointerEvent): void {
    if (e.pointerId !== ponteiro) return;
    arrastando = false;
    ponteiro = -1;
    canvas.classList.remove('arrastando');
    ultimaInteracao = performance.now();
  }

  if (!estatico) {
    /* O canvas tem touch-action: pan-y. No toque, o navegador decide no começo do gesto:
       se for vertical, ele rola a página e manda pointercancel; se for horizontal, os
       movimentos chegam aqui e giram o aparelho. Nunca chamamos preventDefault. */
    ouvir(canvas, 'pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      arrastando = true;
      ponteiro = e.pointerId;
      ultimoX = e.clientX;
      ultimoY = e.clientY;
      ultimoT = e.timeStamp;
      s.vel = 0;
      alvo.yaw = null;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        /* alguns navegadores não deixam capturar: o arrasto segue funcionando dentro do canvas */
      }
      canvas.classList.add('arrastando');
      interagiu();
    });
    ouvir(canvas, 'pointermove', (e) => {
      if (!arrastando || e.pointerId !== ponteiro) return;
      const dx = e.clientX - ultimoX;
      const dy = e.clientY - ultimoY;
      const dt = Math.max((e.timeStamp - ultimoT) / 1000, 0.001);
      ultimoX = e.clientX;
      ultimoY = e.clientY;
      ultimoT = e.timeStamp;
      const porPixel = Math.max(DOIS_PI / (largura * 1.25), 0.006); // uma volta em ~1,25 largura do palco
      s.yaw += dx * porPixel;
      s.vel = s.vel * 0.6 + ((dx * porPixel) / dt) * 0.4; // velocidade suavizada para a inércia
      s.pitch = Math.min(LIMITE_PITCH, Math.max(-LIMITE_PITCH, s.pitch + dy * 0.004));
      sujo = true;
    });
    ouvir(canvas, 'pointerup', soltar);
    ouvir(canvas, 'pointercancel', (e) => {
      s.vel = 0; // o navegador assumiu o gesto (rolagem): sem inércia
      soltar(e);
    });
    ouvir(canvas, 'lostpointercapture', soltar);
    ouvir(canvas, 'keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      e.preventDefault();
      alvo.yaw = null;
      s.vel = e.key === 'ArrowLeft' ? -2.2 : 2.2;
      interagiu();
    });
    const contextoPerdido = (e: Event) => {
      e.preventDefault();
      o.aoPerderContexto?.();
    };
    canvas.addEventListener('webglcontextlost', contextoPerdido);
    limpar.push(() => canvas.removeEventListener('webglcontextlost', contextoPerdido));

    const observadorTamanho = new ResizeObserver(redimensionar);
    observadorTamanho.observe(palco);
    const observadorTela = new IntersectionObserver((entradas) => {
      naTela = entradas.some((x) => x.isIntersecting);
      reavaliar();
    });
    observadorTela.observe(palco);
    document.addEventListener('visibilitychange', reavaliar);
    limpar.push(
      () => observadorTamanho.disconnect(),
      () => observadorTela.disconnect(),
      () => document.removeEventListener('visibilitychange', reavaliar),
    );
  }

  redimensionar();
  // Compila os shaders sem travar a página e só então mostra o primeiro quadro
  marco = performance.now();
  await renderer.compileAsync(scene, camera);
  etapa('shaders');
  desenhar();
  etapa('primeiro-quadro');
  sujo = false;
  if (!estatico) reavaliar();

  return {
    definirCor(hex, imediato) {
      telefone.definirCor(hex, imediato);
      sujo = true;
    },
    focar(id) {
      const a = id ? telefone.ancoras[id] : undefined;
      if (!id || !a) {
        foco = null;
        alvo.yaw = null;
        alvo.zoom = 1;
        alvo.olharX = 0;
        alvo.olharY = OLHAR_Y;
        ultimaInteracao = performance.now();
        return;
      }
      foco = id;
      s.vel = 0;
      // Gira pelo caminho mais curto até a face do ponto ficar de frente
      const base = a.face === 'tras' ? Math.PI : 0;
      alvo.yaw = base + Math.round((s.yaw - base) / DOIS_PI) * DOIS_PI;
      const x = a.face === 'tras' ? -a.pos.x : a.pos.x;
      alvo.zoom = 0.6;
      alvo.olharX = x * 0.55;
      alvo.olharY = a.pos.y * 0.62;
    },
    rolar(progresso) {
      const p = Math.min(1, Math.max(0, progresso));
      if (p !== s.rolagem) {
        s.rolagem = p;
        sujo = true;
      }
    },
    capturar() {
      desenhar();
      return canvas.toDataURL('image/png');
    },
    destruir() {
      ativo = false;
      cancelAnimationFrame(raf);
      limpar.forEach((fn) => fn());
      telefone.destruir();
      geoSombra.dispose();
      matSombra.dispose();
      mapaSombra.dispose();
      ambiente.dispose();
      renderer.dispose();
    },
  };
}
