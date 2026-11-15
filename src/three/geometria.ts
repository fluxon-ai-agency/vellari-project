import { ExtrudeGeometry, Shape, ShapeGeometry, Vector2, type BufferGeometry } from 'three';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';

/** Retângulo com cantos de curvatura contínua (superelipse), como o contorno do aparelho.
    n = 2 dá um arco de círculo; valores maiores deixam o canto mais "quadrado". */
export function contorno(largura: number, altura: number, raio: number, n = 2.6, segmentos = 16): Shape {
  const pontos: Vector2[] = [];
  const hw = largura / 2;
  const hh = altura / 2;
  const r = Math.min(raio, hw, hh);
  const canto = (cx: number, cy: number, inicio: number) => {
    for (let i = 0; i <= segmentos; i++) {
      const a = inicio + (i / segmentos) * (Math.PI / 2);
      const c = Math.cos(a);
      const s = Math.sin(a);
      pontos.push(new Vector2(cx + Math.sign(c) * Math.abs(c) ** (2 / n) * r, cy + Math.sign(s) * Math.abs(s) ** (2 / n) * r));
    }
  };
  canto(hw - r, hh - r, 0);
  canto(-hw + r, hh - r, Math.PI / 2);
  canto(-hw + r, -hh + r, Math.PI);
  canto(hw - r, -hh + r, Math.PI * 1.5);
  return new Shape(pontos);
}

/** Placa extrudada no eixo Z, centrada, com as bordas arredondadas (chanfro suave).
    O contorno externo fica exatamente no tamanho da forma. */
export function placa(forma: Shape, espessura: number, chanfro: number, segmentosChanfro = 5): BufferGeometry {
  const miolo = Math.max(espessura - 2 * chanfro, 0.0001);
  const bruta = new ExtrudeGeometry(forma, {
    depth: miolo,
    steps: 1,
    curveSegments: 1,
    bevelEnabled: chanfro > 0,
    bevelThickness: chanfro,
    bevelSize: chanfro,
    bevelOffset: -chanfro,
    bevelSegments: segmentosChanfro,
  });
  bruta.translate(0, 0, -miolo / 2);
  const lisa = toCreasedNormals(bruta, 0.7);
  bruta.dispose();
  return lisa;
}

/** Face plana com UV de 0 a 1 (ShapeGeometry usa as coordenadas cruas como UV). */
export function face(forma: Shape, largura: number, altura: number): ShapeGeometry {
  const geo = new ShapeGeometry(forma);
  const pos = geo.getAttribute('position');
  const uv = geo.getAttribute('uv');
  for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / largura + 0.5, pos.getY(i) / altura + 0.5);
  uv.needsUpdate = true;
  return geo;
}
