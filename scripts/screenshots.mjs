/* Screenshots do hero e testes de interação (Chrome instalado, via playwright-core).

   Uso: npm run screenshots
   Saída: docs/fase-3/hero-375.png, hero-1440.png e o resultado dos testes no terminal.

   Testes:
   - o 3D substitui o poster;
   - arrasto horizontal no celular gira o aparelho e NÃO rola a página;
   - arrasto vertical no celular rola a página (o canvas não prende a rolagem);
   - trocar a cor atualiza a mensagem do WhatsApp;
   - hotspot abre o card; com "reduzir movimento" fica só o poster. */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { abrir, raiz } from './_navegador.mjs';

const SAIDA = join(raiz, 'docs/fase-3');
mkdirSync(SAIDA, { recursive: true });

const resultados = [];
const checar = (nome, ok, detalhe = '') => {
  resultados.push({ nome, ok });
  console.log(`${ok ? '✓' : '✗'} ${nome}${detalhe ? ` (${detalhe})` : ''}`);
};

const { url, navegador, fechar } = await abrir();
const erros = [];

async function novaPagina(opcoes) {
  const contexto = await navegador.newContext(opcoes);
  const pagina = await contexto.newPage();
  pagina.on('pageerror', (e) => erros.push(e.message));
  pagina.on('console', (m) => {
    if (m.type() === 'error' && !m.text().includes('Failed to load resource')) erros.push(m.text());
  });
  pagina.on('response', (r) => {
    if (r.status() >= 400) erros.push(`${r.status()} ${r.url()}`);
  });
  return { contexto, pagina };
}
// ?3d=1: liga o 3D mesmo no Chrome sem placa de vídeo usado nos testes
const URL_3D = url + '?3d=1';
const esperar3D = (pagina) => pagina.waitForSelector('#hero-palco[data-estado="3d"]', { timeout: 60000 });
/** Lê a rotação atual pela posição de um hotspot (muda quando o aparelho gira). */
const posicaoPonto = (pagina) => pagina.evaluate(() => document.querySelector('[data-hotspot="camera"]').style.transform);

try {
  /* ---------- Celular: 375 px ---------- */
  {
    const { contexto, pagina } = await novaPagina({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await pagina.goto(URL_3D, { timeout: 120000 });
    await esperar3D(pagina);
    await pagina.waitForTimeout(900);
    await pagina.screenshot({ path: join(SAIDA, 'hero-375.png') });
    checar('375 px: 3D substituiu o poster', true);

    const cta = await pagina.locator('#hero-cta').boundingBox();
    checar('375 px: CTA aparece sem rolar', cta !== null && cta.y + cta.height <= 812, cta ? `base do botão em ${Math.round(cta.y + cta.height)} de 812 px` : 'sem botão');
    const semRolagemLateral = await pagina.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    checar('375 px: sem rolagem horizontal', semRolagemLateral);

    const cdp = await contexto.newCDPSession(pagina);
    const caixa = await pagina.locator('#hero-canvas').boundingBox();
    const cx = Math.round(caixa.x + caixa.width / 2);
    const cy = Math.round(caixa.y + caixa.height / 2);
    const toque = async (tipo, x, y) =>
      cdp.send('Input.dispatchTouchEvent', { type: tipo, touchPoints: tipo === 'touchEnd' ? [] : [{ x, y, id: 1 }] });

    // Arrasto horizontal: gira, não rola
    const antesGiro = await posicaoPonto(pagina);
    await toque('touchStart', cx - 80, cy);
    for (let i = 1; i <= 12; i++) {
      await toque('touchMove', cx - 80 + i * 14, cy);
      await pagina.waitForTimeout(16);
    }
    await toque('touchEnd');
    await pagina.waitForTimeout(250);
    const depoisGiro = await posicaoPonto(pagina);
    const rolouNoGiro = await pagina.evaluate(() => window.scrollY);
    checar('Toque: arrasto horizontal gira o aparelho', antesGiro !== depoisGiro);
    checar('Toque: arrasto horizontal não rola a página', rolouNoGiro === 0, `scrollY = ${rolouNoGiro}`);
    const dicaSumiu = await pagina.evaluate(() => document.getElementById('hero-dica').classList.contains('sumir'));
    checar('"Arraste para girar" some depois da primeira interação', dicaSumiu);

    // Arrasto vertical sobre o canvas: a página rola (gesto real, feito pelo navegador).
    // Enquanto o site só tem o hero, a página é esticada aqui para ter para onde rolar.
    await pagina.evaluate(() => {
      if (document.documentElement.scrollHeight <= window.innerHeight + 200) document.body.style.minHeight = '250vh';
    });
    // (Input.synthesizeScrollGesture não rola nada no Chrome sem interface, nem fora do canvas;
    //  por isso o teste usa toques crus e compara com um ponto de controle no título.)
    const arrastarParaCima = async (x, y) => {
      await pagina.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await pagina.waitForTimeout(250);
      await toque('touchStart', x, y);
      for (let i = 1; i <= 15; i++) {
        await toque('touchMove', x, y - i * 16);
        await pagina.waitForTimeout(16);
      }
      await toque('touchEnd');
      await pagina.waitForTimeout(450);
      return pagina.evaluate(() => Math.round(window.scrollY));
    };
    const titulo = await pagina.locator('#titulo-hero').boundingBox();
    const rolouControle = await arrastarParaCima(Math.round(titulo.x + 60), Math.round(titulo.y + titulo.height / 2));
    const rolouVertical = await arrastarParaCima(cx + 25, Math.round(caixa.y + caixa.height * 0.72));
    checar('Toque: arrasto vertical sobre o aparelho rola a página', rolouVertical > 100, `scrollY = ${rolouVertical}`);
    checar('Toque: rola tanto quanto fora do canvas', Math.abs(rolouVertical - rolouControle) <= 4, `canvas ${rolouVertical} px, título ${rolouControle} px`);
    await pagina.evaluate(() => {
      window.scrollTo(0, 0);
      document.body.style.minHeight = '';
    });
    await pagina.waitForTimeout(300);

    // Cor: atualiza a mensagem do WhatsApp
    await pagina.locator('input[name="hero-cor"][value="glacial"]').check({ force: true });
    await pagina.waitForTimeout(700);
    const href = await pagina.locator('#hero-cta').getAttribute('href');
    const mensagem = decodeURIComponent(href.split('text=')[1] ?? '');
    checar('Cor: link usa wa.me/5517997220015', href.startsWith('https://wa.me/5517997220015?text='));
    checar('Cor: a mensagem leva a cor escolhida', mensagem === 'Olá! Vi o iPhone 18 Pro Max Glacial no site da Vellari e quero saber valores e condições.', mensagem);
    await pagina.screenshot({ path: join(SAIDA, 'hero-375-glacial.png') });

    // Hotspot pelo teclado (funciona mesmo com o ponto do outro lado do aparelho):
    // abre o card, gira até a câmera e aproxima
    await pagina.locator('[data-hotspot="camera"]').focus();
    await pagina.keyboard.press('Enter');
    await pagina.waitForTimeout(1400);
    const cardAberto = await pagina.evaluate(() => !document.getElementById('hero-card').hidden && document.getElementById('hero-card-titulo').textContent);
    checar('Hotspot: abre o card da câmera', cardAberto === 'Câmera Fusion de 48 MP', String(cardAberto));
    await pagina.screenshot({ path: join(SAIDA, 'hero-375-hotspot.png') });
    await pagina.keyboard.press('Escape');
    await pagina.waitForTimeout(200);
    checar('Hotspot: Esc fecha o card', await pagina.evaluate(() => document.getElementById('hero-card').hidden));
    await contexto.close();
  }

  /* ---------- Desktop: 1440 px ---------- */
  {
    const { contexto, pagina } = await novaPagina({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    await pagina.goto(URL_3D, { timeout: 120000 });
    await esperar3D(pagina);
    await pagina.waitForTimeout(900);
    await pagina.screenshot({ path: join(SAIDA, 'hero-1440.png') });
    checar('1440 px: 3D substituiu o poster', true);

    // Arrasto com o mouse
    const caixa = await pagina.locator('#hero-canvas').boundingBox();
    const antes = await posicaoPonto(pagina);
    await pagina.mouse.move(caixa.x + caixa.width / 2, caixa.y + caixa.height * 0.7);
    await pagina.mouse.down();
    await pagina.mouse.move(caixa.x + caixa.width / 2 + 260, caixa.y + caixa.height * 0.7, { steps: 12 });
    await pagina.mouse.up();
    await pagina.waitForTimeout(600);
    checar('Mouse: arrastar gira o aparelho', antes !== (await posicaoPonto(pagina)));
    await pagina.screenshot({ path: join(SAIDA, 'hero-1440-girado.png') });

    // Teclado: os hotspots são botões alcançáveis com Tab
    const focaveis = await pagina.evaluate(() => Array.from(document.querySelectorAll('.hotspot')).every((b) => b.tabIndex === 0 && !b.closest('[hidden]')));
    checar('Teclado: hotspots são botões focáveis', focaveis);
    await contexto.close();
  }

  /* ---------- Reduzir movimento: só o poster ---------- */
  {
    const { contexto, pagina } = await novaPagina({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    await pagina.goto(URL_3D, { timeout: 120000 });
    await pagina.waitForLoadState('load');
    await pagina.waitForTimeout(2500);
    const estado = await pagina.evaluate(() => document.getElementById('hero-palco').dataset.estado);
    checar('Reduzir movimento: mantém o poster estático', estado === 'poster', `estado = ${estado}`);
    await pagina.locator('input[name="hero-cor"][value="prata"]').check({ force: true });
    const src = await pagina.evaluate(() => document.querySelector('#hero-poster img').getAttribute('src'));
    checar('Reduzir movimento: o seletor de cores troca o poster', src.includes('poster-prata-'), src);
    await pagina.waitForTimeout(400);
    await pagina.screenshot({ path: join(SAIDA, 'hero-375-poster-prata.png') });
    await contexto.close();
  }
} finally {
  await fechar();
}

checar('Nenhum erro no console', erros.length === 0, erros.slice(0, 3).join(' | '));
const falhas = resultados.filter((r) => !r.ok).length;
console.log(`\n${resultados.length - falhas} de ${resultados.length} verificações passaram. Screenshots em docs/fase-3/`);
process.exit(falhas ? 1 : 0);
