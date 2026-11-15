/* iPhone 18 Pro Max procedural. Geometria 100% gerada em código, sem logo da Apple.
   Unidade: 1 = 1 cm. Proporções reais: 163,4 x 78 x 8,75 mm.

   Referência do desenho: o briefing (platô horizontal de câmeras em toda a largura do topo
   da traseira, três lentes em triângulo à esquerda, flash e LiDAR à direita) e as fotos do
   iPhone 17 Pro Max em assets/, que tem o visual externo praticamente igual. */
import {
  CanvasTexture,
  CapsuleGeometry,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DataTexture,
  Group,
  LatheGeometry,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  SRGBColorSpace,
  Vector2,
  Vector3,
  type BufferGeometry,
  type Material,
  type Texture,
} from 'three';
import { contorno, face, placa } from './geometria.ts';

export const DIM = { largura: 7.8, altura: 16.34, espessura: 0.875 } as const;

const L = DIM.largura;
const A = DIM.altura;
const E = DIM.espessura;
const RAIO = 1.45;
const BRANCO = new Color(0xffffff);
const CLAREAR_VIDRO = 0.03; // o painel de vidro é só um pouco mais claro que o alumínio
const CLAREAR_ANEL = 0.14;

/* Platô de câmeras (coordenadas vistas por trás do aparelho) */
const PLATO = { largura: L - 0.56, altura: 3.9, raio: 1.2, relevo: 0.24, y: A / 2 - 0.42 - 1.95 };
const LENTE = { raio: 0.8, x: -2.2, dy: 0.93, x3: -0.55 };

export interface Ancora {
  /** Posição no espaço do aparelho. */
  pos: Vector3;
  normal: Vector3;
  face: 'frente' | 'tras';
}

export interface Telefone {
  grupo: Group;
  ancoras: Record<string, Ancora>;
  definirCor(hex: string, imediato?: boolean): void;
  /** Avança a transição de cor. Devolve true enquanto ainda está mudando. */
  atualizar(dt: number): boolean;
  destruir(): void;
}

/* ---------- Texturas feitas em canvas (nenhum arquivo externo) ---------- */

/** Wallpaper da tela: gradiente nas cores da marca Vellari, com o arco. */
function texturaTela(): Texture {
  const w = 512;
  const h = 1072;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  if (g) {
    g.fillStyle = '#03050c';
    g.fillRect(0, 0, w, h);
    const brilho = (x: number, y: number, r: number, cor: string) => {
      const rad = g.createRadialGradient(x, y, 0, x, y, r);
      rad.addColorStop(0, cor);
      rad.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rad;
      g.fillRect(0, 0, w, h);
    };
    brilho(w * 0.18, h * 0.3, w * 0.95, 'rgba(7,77,255,.95)');
    brilho(w * 0.95, h * 0.72, w * 0.85, 'rgba(30,140,255,.6)');
    brilho(w * 0.4, h * 1.02, w * 0.8, 'rgba(2,55,201,.8)');
    // Arco Vellari: sobe da esquerda para a direita
    const arco = g.createLinearGradient(w * 0.12, 0, w * 0.88, 0);
    arco.addColorStop(0, '#0237C9');
    arco.addColorStop(0.55, '#3F7BFF');
    arco.addColorStop(1, '#9CC8FF');
    g.strokeStyle = arco;
    g.lineWidth = 16;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.beginPath();
    g.moveTo(w * 0.12, h * 0.6);
    g.bezierCurveTo(w * 0.38, h * 0.63, w * 0.66, h * 0.58, w * 0.86, h * 0.47);
    g.stroke();
    g.beginPath();
    g.moveTo(w * 0.72, h * 0.455);
    g.lineTo(w * 0.86, h * 0.47);
    g.lineTo(w * 0.8, h * 0.53);
    g.stroke();
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Textura branca de 1 pixel (ver o comentário dos materiais). */
function texturaBranca(): Texture {
  const t = new DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  t.colorSpace = SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

/** Vidro da lente: anéis concêntricos (o eixo V vai da borda ao centro). */
function texturaLente(): Texture {
  const c = document.createElement('canvas');
  c.width = 8;
  c.height = 256;
  const g = c.getContext('2d');
  if (g) {
    // topo do canvas = centro da lente; base = borda
    const grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#010102');
    grad.addColorStop(0.14, '#020308');
    grad.addColorStop(0.18, '#0d1730');
    grad.addColorStop(0.34, '#070c1c');
    grad.addColorStop(0.44, '#110f22');
    grad.addColorStop(0.5, '#05060a');
    grad.addColorStop(0.72, '#090a0e');
    grad.addColorStop(0.76, '#22252e');
    grad.addColorStop(0.8, '#07080b');
    grad.addColorStop(1, '#040405');
    g.fillStyle = grad;
    g.fillRect(0, 0, 8, 256);
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/* ---------- Montagem ---------- */

export function criarTelefone(corInicial: string): Telefone {
  const geometrias: BufferGeometry[] = [];
  const materiais: Material[] = [];
  const texturas: Texture[] = [];
  const geo = <T extends BufferGeometry>(g: T): T => (geometrias.push(g), g);
  const mat = <T extends Material>(m: T): T => (materiais.push(m), m);

  // Tons derivados da cor escolhida
  const tomCorpo = new Color(corInicial);
  const tomVidro = tomCorpo.clone().lerp(BRANCO, CLAREAR_VIDRO);
  const tomAnel = tomCorpo.clone().lerp(BRANCO, CLAREAR_ANEL);

  /* Materiais PBR.
     Para o 3D abrir rápido em aparelho simples, o modelo inteiro usa só 2 programas de shader
     (a compilação de cada um custa caro em placa de vídeo fraca):
     - metais e peças foscas: MeshStandardMaterial;
     - tudo que tem verniz (vidro traseiro, vidros pretos, lentes e tela): MeshPhysicalMaterial
       com clearcoat, map e emissiveMap. Quem não precisa de textura recebe uma branca de 1 pixel
       e emissão preta, só para cair no mesmo programa. O visual é o mesmo. */
  const mapaLente = texturaLente();
  const mapaTela = texturaTela();
  const branco = texturaBranca();
  texturas.push(mapaLente, mapaTela, branco);
  const verniz = (p: ConstructorParameters<typeof MeshPhysicalMaterial>[0]) =>
    mat(new MeshPhysicalMaterial({ map: branco, emissiveMap: branco, emissive: 0x000000, ...p }));

  const aluminio = mat(new MeshStandardMaterial({ color: tomCorpo.clone(), metalness: 1, roughness: 0.46 })); // metal acetinado
  // Vidro fosco: mesmo tom do corpo, um pouco mais claro, com brilho suave por cima
  const vidroTraseiro = verniz({ color: tomVidro.clone(), metalness: 0.55, roughness: 0.5, clearcoat: 0.25, clearcoatRoughness: 0.45 });
  const anel = mat(new MeshStandardMaterial({ color: tomAnel.clone(), metalness: 1, roughness: 0.16 })); // anéis polidos
  const preto = mat(new MeshStandardMaterial({ color: 0x040405, metalness: 0.2, roughness: 0.5 }));
  const pretoBrilho = verniz({ color: 0x030304, metalness: 0, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 });
  const vidroLente = verniz({ map: mapaLente, metalness: 0, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0 }); // lente com clearcoat
  const tela = verniz({ color: 0x000000, emissive: 0xffffff, emissiveMap: mapaTela, emissiveIntensity: 0.85, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.03 });
  const flash = mat(new MeshStandardMaterial({ color: 0xfff1d0, emissive: 0xffe9b8, emissiveIntensity: 0.25, roughness: 0.35 }));

  const grupo = new Group();
  grupo.name = 'iphone-18-pro-max';
  const malha = (g: BufferGeometry, m: Material, pai: Group = grupo) => {
    const x = new Mesh(g, m);
    pai.add(x);
    return x;
  };

  /* 1. Corpo unibody de alumínio, com as bordas arredondadas */
  malha(geo(placa(contorno(L, A, RAIO, 2.7, 20), E, 0.2, 6)), aluminio);

  /* 2. Frente: moldura fina, tela e Dynamic Island */
  const zFrente = E / 2;
  malha(geo(face(contorno(L - 0.1, A - 0.1, RAIO - 0.05, 2.7, 20), L, A)), pretoBrilho).position.z = zFrente + 0.003;
  const telaL = L - 0.4;
  const telaA = A - 0.4;
  malha(geo(face(contorno(telaL, telaA, RAIO - 0.2, 2.7, 20), telaL, telaA)), tela).position.z = zFrente + 0.006;
  // Dynamic Island menor
  const ilha = malha(geo(face(contorno(1.9, 0.56, 0.28, 2, 10), 1.9, 0.56)), preto);
  ilha.position.set(0, A / 2 - 0.2 - 0.74, zFrente + 0.009);
  const cameraFrontal = malha(geo(new CircleGeometry(0.13, 20)), pretoBrilho);
  cameraFrontal.position.set(0.58, A / 2 - 0.2 - 0.74, zFrente + 0.011);

  /* 3. Traseira. O grupo gira 180° para ser desenhado como é visto por trás. */
  const tras = new Group();
  tras.rotation.y = Math.PI;
  grupo.add(tras);
  const zTras = E / 2;

  // Painel de vidro fosco abaixo do platô
  const vidroL = L - 1.0;
  const vidroA = 10.6;
  malha(geo(face(contorno(vidroL, vidroA, 1.1, 2.6, 16), vidroL, vidroA)), vidroTraseiro, tras).position.set(0, -2.1, zTras + 0.004);

  // Platô de câmeras em toda a largura do topo
  malha(geo(placa(contorno(PLATO.largura, PLATO.altura, PLATO.raio, 2.6, 16), PLATO.relevo, 0.07, 4)), aluminio, tras).position.set(
    0,
    PLATO.y,
    zTras + PLATO.relevo / 2 - 0.01,
  );
  const zPlato = zTras + PLATO.relevo - 0.01;

  // Três lentes em triângulo, à esquerda
  const gAnel = geo(new CylinderGeometry(LENTE.raio, LENTE.raio + 0.035, 0.15, 56));
  gAnel.rotateX(Math.PI / 2);
  const gPoco = geo(new CylinderGeometry(LENTE.raio - 0.12, LENTE.raio - 0.12, 0.16, 56));
  gPoco.rotateX(Math.PI / 2);
  // Vidro levemente abaulado. O perfil vai da borda ao centro para as normais apontarem para fora.
  const rVidro = LENTE.raio - 0.14;
  const perfil: Vector2[] = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const r = rVidro * (1 - t);
    perfil.push(new Vector2(r, 0.045 * (1 - (r / rVidro) ** 2)));
  }
  const gVidro = geo(new LatheGeometry(perfil, 56));
  gVidro.rotateX(Math.PI / 2);

  const lentes: Array<[number, number]> = [
    [LENTE.x, PLATO.y + LENTE.dy],
    [LENTE.x, PLATO.y - LENTE.dy],
    [LENTE.x3, PLATO.y],
  ];
  for (const [x, y] of lentes) {
    malha(gAnel, anel, tras).position.set(x, y, zPlato + 0.075);
    malha(gPoco, preto, tras).position.set(x, y, zPlato + 0.081);
    malha(gVidro, vidroLente, tras).position.set(x, y, zPlato + 0.162);
  }

  // Flash, microfone e LiDAR, à direita
  const xDireita = 2.35;
  const gAro = geo(new CylinderGeometry(0.37, 0.37, 0.03, 32));
  gAro.rotateX(Math.PI / 2);
  malha(gAro, anel, tras).position.set(xDireita, PLATO.y + LENTE.dy, zPlato + 0.014);
  malha(geo(new CircleGeometry(0.31, 32)), flash, tras).position.set(xDireita, PLATO.y + LENTE.dy, zPlato + 0.031);
  malha(geo(new CircleGeometry(0.34, 32)), pretoBrilho, tras).position.set(xDireita, PLATO.y - LENTE.dy, zPlato + 0.004);
  malha(geo(new CircleGeometry(0.06, 16)), preto, tras).position.set(xDireita, PLATO.y, zPlato + 0.004);

  /* 4. Botões laterais (vistos de frente: esquerda = -x) */
  const botao = (comprimento: number, y: number, lado: 1 | -1, m: Material = aluminio, saliencia = 0.3) => {
    const b = malha(geo(new CapsuleGeometry(0.17, comprimento, 6, 12)), m);
    b.scale.x = saliencia;
    b.position.set(lado * (L / 2), y, 0);
    return b;
  };
  botao(0.55, 4.55, -1); // botão de Ação
  botao(0.95, 3.0, -1); // volume +
  botao(0.95, 1.55, -1); // volume −
  botao(1.75, 2.7, 1); // botão lateral
  botao(1.35, -2.7, 1, anel, 0.12); // Controle da Câmera (rente ao corpo, polido)

  /* 5. Conector na base */
  const porta = malha(geo(new CapsuleGeometry(0.13, 0.6, 6, 12)), preto);
  porta.rotation.z = Math.PI / 2;
  porta.scale.x = 0.25;
  porta.position.set(0, -A / 2 + 0.004, 0);

  /* Pontos de interesse (hotspots) */
  const ancoras: Record<string, Ancora> = {
    // x invertido: o grupo da traseira está girado 180°
    // fica no platô, entre as lentes e o flash, para não cobrir nenhuma lente
    camera: { pos: new Vector3(-0.9, PLATO.y + 0.2, -(zPlato + 0.05)), normal: new Vector3(0, 0, -1), face: 'tras' },
    chip: { pos: new Vector3(0, -1.6, -(zTras + 0.02)), normal: new Vector3(0, 0, -1), face: 'tras' },
    tela: { pos: new Vector3(0, 0.6, zFrente + 0.02), normal: new Vector3(0, 0, 1), face: 'frente' },
  };

  /* Troca de cor com transição suave */
  const alvoCorpo = tomCorpo.clone();
  const alvoVidro = tomVidro.clone();
  const alvoAnel = tomAnel.clone();
  let transicao = 0; // 1 = acabou de mudar, 0 = parado

  function definirCor(hex: string, imediato = false): void {
    alvoCorpo.set(hex);
    alvoVidro.copy(alvoCorpo).lerp(BRANCO, CLAREAR_VIDRO);
    alvoAnel.copy(alvoCorpo).lerp(BRANCO, CLAREAR_ANEL);
    if (imediato) {
      aluminio.color.copy(alvoCorpo);
      vidroTraseiro.color.copy(alvoVidro);
      anel.color.copy(alvoAnel);
      transicao = 0;
    } else {
      transicao = 1;
    }
  }

  function atualizar(dt: number): boolean {
    if (transicao <= 0) return false;
    const k = 1 - Math.exp(-7 * dt);
    aluminio.color.lerp(alvoCorpo, k);
    vidroTraseiro.color.lerp(alvoVidro, k);
    anel.color.lerp(alvoAnel, k);
    transicao *= Math.exp(-7 * dt);
    if (transicao < 0.004) {
      aluminio.color.copy(alvoCorpo);
      vidroTraseiro.color.copy(alvoVidro);
      anel.color.copy(alvoAnel);
      transicao = 0;
    }
    return true;
  }

  function destruir(): void {
    geometrias.forEach((g) => g.dispose());
    materiais.forEach((m) => m.dispose());
    texturas.forEach((t) => t.dispose());
  }

  return { grupo, ancoras, definirCor, atualizar, destruir };
}
