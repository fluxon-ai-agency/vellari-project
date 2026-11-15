/* QA da página inteira, sobre o build de produção (dist/).

   Uso: npm run qa   (roda "npm run build" antes; precisa do Chrome ou do Edge)
   Saída: docs/fase-7/*.png e o resultado dos testes no terminal.

   Confere: links de WhatsApp (número e mensagens), "sem juros", filtros, busca, ordenação,
   modal, entrega, botão flutuante e nota de fora do horário, rolagem no toque, SEO básico,
   acessibilidade básica e erros no console. Gera screenshots em 375, 768 e 1440 px. */
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { preview } from 'vite';
import { raiz } from './_navegador.mjs';

const SAIDA = join(raiz, 'docs/fase-7');
mkdirSync(SAIDA, { recursive: true });
if (!existsSync(join(raiz, 'dist/index.html'))) {
  console.error('dist/ não existe. Rode "npm run build" antes.');
  process.exit(1);
}

const NUMERO = '5517997220015';
const MSG = {
  geral: /^Olá! Vim pelo site da Vellari Phone e quero tirar uma dúvida\.$/,
  hero: /^Olá! Vi o iPhone 18 Pro Max (Bordô|Preto|Prata|Glacial) no site da Vellari e quero saber valores e condições\.$/,
  produto: /^Olá! Tenho interesse no \S.+ \((Lacrado|Seminovo)\) que vi no site\.$/,
  entrega: /^Olá! Sou de \S.+ e quero saber como funciona a entrega\.$/,
};

const resultados = [];
const checar = (nome, ok, detalhe = '') => {
  resultados.push({ nome, ok: Boolean(ok) });
  console.log(`${ok ? '✓' : '✗'} ${nome}${detalhe ? ` (${detalhe})` : ''}`);
};

const servidor = await preview({ root: raiz, logLevel: 'error', preview: { port: 4199, strictPort: false } });
const url = servidor.resolvedUrls?.local[0] ?? 'http://localhost:4199/';
let navegador;
for (const channel of ['chrome', 'msedge']) {
  try {
    navegador = await chromium.launch({ channel, headless: true, args: ['--ignore-gpu-blocklist', '--enable-unsafe-swiftshader', '--use-angle=swiftshader'] });
    break;
  } catch {
    /* tenta o próximo */
  }
}
if (!navegador) throw new Error('Não encontrei o Chrome nem o Edge instalados.');

const erros = [];
async function novaPagina(opcoes) {
  const contexto = await navegador.newContext({ locale: 'pt-BR', timezoneId: 'America/Sao_Paulo', ...opcoes });
  const pagina = await contexto.newPage();
  pagina.on('pageerror', (e) => erros.push(`erro de página: ${e.message}`));
  pagina.on('console', (m) => {
    const local = m.location().url ?? '';
    // Só conta o que é do próprio site (o mapa do Google roda num iframe de terceiros)
    if (m.type() === 'error' && (local === '' || local.startsWith(url)) && !m.text().includes('Failed to load resource')) erros.push(`console: ${m.text()}`);
  });
  pagina.on('response', (r) => {
    if (r.status() >= 400 && r.url().startsWith(url)) erros.push(`${r.status()} ${r.url()}`);
  });
  return { contexto, pagina };
}
// ?3d=1: liga o 3D mesmo no Chrome sem placa de vídeo usado nos testes
const URL_3D = url + '?3d=1';
const esperar3D = (pagina) => pagina.waitForSelector('#hero-palco[data-estado="3d"]', { timeout: 90000 });
const linksWhats = (pagina) =>
  pagina.evaluate(() => Array.from(document.querySelectorAll('a[data-wa]')).map((a) => ({ origem: a.dataset.wa, local: a.dataset.waLocal, href: a.getAttribute('href') })));
const sufixo = (n) => String(n).padStart(2, '0');

// Screenshot da página inteira. Captura em faixas e costura: o Chrome sem interface
// repete a imagem quando a página passa de 8192 px de altura.
async function capturarPagina(pagina, arquivo) {
  const estilo = await pagina.addStyleTag({ content: '.topo{position:static!important}.wa-flutuante,.hero-dica{display:none!important}html{scroll-behavior:auto!important}' });
  // rola até o fim para as imagens com lazy loading carregarem
  await pagina.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);
  });
  await pagina.waitForTimeout(800);
  const { total, janela, largura } = await pagina.evaluate(() => ({ total: document.documentElement.scrollHeight, janela: window.innerHeight, largura: window.innerWidth }));
  const faixas = [];
  let escala = 1;
  for (let y = 0; y < total; y += janela) {
    const topo = Math.min(y, total - janela);
    await pagina.evaluate((t) => window.scrollTo(0, t), topo);
    await pagina.waitForTimeout(180);
    const buffer = await pagina.screenshot();
    const meta = await sharp(buffer).metadata();
    escala = meta.width / largura;
    const sobra = Math.round((y - topo) * escala); // a última faixa repete um pedaço da anterior
    faixas.push({ input: sobra ? await sharp(buffer).extract({ left: 0, top: sobra, width: meta.width, height: meta.height - sobra }).toBuffer() : buffer, top: Math.round(y * escala), left: 0 });
  }
  await sharp({ create: { width: Math.round(largura * escala), height: Math.round(total * escala), channels: 3, background: '#050505' } })
    .composite(faixas)
    .jpeg({ quality: 82 })
    .toFile(arquivo);
  await estilo.evaluate((el) => el.remove());
  await pagina.evaluate(() => window.scrollTo(0, 0));
}

try {
  /* =============== Celular (375 px) =============== */
  {
    const { contexto, pagina } = await novaPagina({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await pagina.goto(URL_3D, { timeout: 120000 });
    await esperar3D(pagina);

    /* ---- Links de WhatsApp ---- */
    const links = await linksWhats(pagina);
    // os moldes dos modais também têm links: confere todos
    const linksModais = await pagina.evaluate(() =>
      Array.from(document.querySelectorAll('template[data-modal]')).flatMap((t) =>
        Array.from(t.content.querySelectorAll('a[data-wa]')).map((a) => ({ origem: a.dataset.wa, local: a.dataset.waLocal, href: a.getAttribute('href') })),
      ),
    );
    const todos = [...links, ...linksModais];
    const ruins = todos.filter((l) => {
      if (!l.href?.startsWith(`https://wa.me/${NUMERO}?text=`)) return true;
      const texto = decodeURIComponent(l.href.split('text=')[1] ?? '');
      return !MSG[l.origem]?.test(texto);
    });
    checar(`WhatsApp: ${todos.length} links usam wa.me/${NUMERO} com a mensagem da origem`, todos.length > 30 && ruins.length === 0, ruins.slice(0, 2).map((l) => `${l.local}: ${decodeURIComponent(l.href ?? '')}`).join(' | '));
    const porOrigem = Object.fromEntries(Object.keys(MSG).map((o) => [o, todos.filter((l) => l.origem === o).length]));
    checar('WhatsApp: há links das 4 origens (hero, produto, entrega, geral)', Object.values(porOrigem).every((n) => n > 0), JSON.stringify(porOrigem));
    const exemplo = todos.find((l) => l.origem === 'produto' && l.href.includes('iPhone%2014%20128'));
    checar('WhatsApp: mensagem de produto completa', exemplo && decodeURIComponent(exemplo.href.split('text=')[1]) === 'Olá! Tenho interesse no iPhone 14 128 GB Meia-noite (Seminovo) que vi no site.', exemplo ? decodeURIComponent(exemplo.href.split('text=')[1]) : 'não achei o iPhone 14');

    /* ---- Textos ---- */
    const texto = await pagina.evaluate(() => document.documentElement.innerHTML);
    checar('Texto: nenhum "sem juros" na página', !/sem\s+juros/i.test(texto));
    checar('Texto: parcelamento sempre "em até 18x (com juros)"', (texto.match(/em até 18x \(com juros\)/g) ?? []).length > 20);
    checar('Texto: aviso de marca no rodapé', texto.includes('iPhone é marca registrada da Apple Inc. A Vellari Phone não tem vínculo com a Apple.'));
    checar('Texto: nenhum colchete de placeholder visível', !/\[(CONFIRMAR|N[ÚU]MERO|FOTO)[^\]]*\]/i.test(await pagina.evaluate(() => document.body.innerText)));
    checar('Texto: CNPJ no rodapé', (await pagina.locator('.rodape-base').innerText()).includes('41.253.575/0001-01'));

    /* ---- SEO e acessibilidade básicos ---- */
    checar('SEO: um único h1', (await pagina.locator('h1').count()) === 1);
    checar('SEO: title cita "Loja de iPhone em Santa Fé do Sul"', (await pagina.title()).includes('Loja de iPhone em Santa Fé do Sul'));
    const ld = await pagina.evaluate(() => Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) => JSON.parse(s.textContent)));
    const loja = ld.find((x) => x['@type'] === 'MobilePhoneStore');
    checar('SEO: JSON-LD MobilePhoneStore completo', loja && loja.telephone === '+55 17 99722-0015' && loja.address?.postalCode === '15775-057' && loja.areaServed?.length === 8 && loja.sameAs?.[0]?.includes('instagram.com/vellari_phone'), loja ? `${loja.areaServed?.length} cidades` : 'ausente');
    const semAlt = await pagina.evaluate(() => {
      const fora = Array.from(document.querySelectorAll('img')).filter((i) => !i.hasAttribute('alt') || i.alt.trim() === '');
      const moldes = Array.from(document.querySelectorAll('template')).flatMap((t) => Array.from(t.content.querySelectorAll('img'))).filter((i) => !i.getAttribute('alt')?.trim());
      return fora.length + moldes.length;
    });
    checar('Acessibilidade: todas as imagens têm alt descritivo', semAlt === 0, `${semAlt} sem alt`);
    const pequenos = await pagina.evaluate(() => {
      const visivel = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !el.closest('[hidden]') && getComputedStyle(el).visibility !== 'hidden'; };
      return Array.from(document.querySelectorAll('a, button, input, select, summary, label.chip, label.amostra'))
        .filter(visivel)
        .filter((el) => !(el.matches('input') && el.closest('label.chip, label.amostra'))) // a área de toque é a do label
        .filter((el) => !el.matches('.card-link')) // a área de toque é o card inteiro (::after)
        .map((el) => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.height < 43.5 || r.width < 43.5)
        .map(({ el, r }) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]} ${Math.round(r.width)}x${Math.round(r.height)} "${(el.textContent || '').trim().slice(0, 24)}"`);
    });
    checar('Acessibilidade: áreas de toque de pelo menos 44 px', pequenos.length === 0, pequenos.slice(0, 6).join(' | '));
    checar('375 px: sem rolagem horizontal', await pagina.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));

    /* ---- Botão flutuante ---- */
    checar('Flutuante: escondido enquanto o CTA do hero está na tela', (await pagina.locator('#wa-flutuante').getAttribute('data-visivel')) === '0');
    await pagina.locator('#vitrine').scrollIntoViewIfNeeded();
    await pagina.waitForTimeout(600);
    checar('Flutuante: aparece depois de rolar', (await pagina.locator('#wa-flutuante').getAttribute('data-visivel')) === '1');

    /* ---- Screenshots por seção (375 px) ---- */
    let n = 1;
    for (const id of ['inicio', 'mais-vendidos', 'vitrine', 'loja', 'clientes', 'entrega', 'duvidas', 'contato']) {
      await pagina.evaluate((alvo) => {
        const el = document.getElementById(alvo);
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 60, behavior: 'instant' });
      }, id);
      await pagina.waitForTimeout(700);
      await pagina.screenshot({ path: join(SAIDA, `375-${sufixo(n++)}-${id}.png`) });
    }

    /* ---- Vitrine: filtros, busca e ordenação ---- */
    await pagina.locator('#vitrine').scrollIntoViewIfNeeded();
    const visiveis = () => pagina.evaluate(() => Array.from(document.querySelectorAll('#grade-produtos .card-produto')).filter((c) => !c.hidden).map((c) => ({ cat: c.dataset.categoria, cond: c.dataset.condicao, nome: c.querySelector('.card-nome').textContent.trim() })));
    const total = (await visiveis()).length;
    await pagina.locator('#categorias [data-cat="Android"]').click();
    let lista = await visiveis();
    checar('Vitrine: filtro por categoria (Android)', lista.length > 0 && lista.every((c) => c.cat === 'Android'), `${lista.length} de ${total}`);
    await pagina.locator('#categorias [data-cat="Todos"]').click();
    await pagina.locator('#condicoes [data-cond="Lacrado"]').click();
    lista = await visiveis();
    checar('Vitrine: filtro por condição (Lacrado)', lista.length > 0 && lista.every((c) => c.cond === 'Lacrado'), `${lista.length} de ${total}`);
    await pagina.locator('#condicoes [data-cond="Todos"]').click();
    await pagina.locator('#busca').fill('redmi note');
    lista = await visiveis();
    checar('Vitrine: busca por nome ("redmi note")', lista.length > 0 && lista.every((c) => /redmi note/i.test(c.nome)), lista.map((c) => c.nome).join(', '));
    checar('Vitrine: a contagem acompanha', (await pagina.locator('#contagem').innerText()) === `${lista.length} produtos`);
    await pagina.locator('#busca').fill('zzzz');
    checar('Vitrine: busca sem resultado mostra o convite ao WhatsApp', !(await pagina.locator('#vitrine-vazia').isHidden()));
    await pagina.locator('#busca').fill('');
    await pagina.locator('#ordenar').selectOption('nome');
    lista = await visiveis();
    const nomes = lista.map((c) => c.nome);
    checar('Vitrine: ordenação por nome', nomes.join('|') === [...nomes].sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true })).join('|'), nomes.slice(0, 3).join(', '));
    await pagina.locator('#ordenar').selectOption('destaque');
    const colunas = await pagina.evaluate(() => getComputedStyle(document.getElementById('grade-produtos')).gridTemplateColumns.split(' ').length);
    checar('Vitrine: grade de 2 colunas no celular', colunas === 2, `${colunas} colunas`);

    /* ---- Modal ---- */
    const cartao = pagina.locator('#grade-produtos [data-produto="iphone-17-pro-max"] .card-link');
    await cartao.scrollIntoViewIfNeeded();
    await cartao.click();
    await pagina.waitForTimeout(600);
    const modal = await pagina.evaluate(() => {
      const d = document.getElementById('modal-produto');
      return { aberto: d.open, nome: d.querySelector('#mp-nome')?.textContent, fotos: d.querySelectorAll('.mp-foto img').length, pagamento: d.querySelector('.mp-pagamento')?.textContent ?? '', href: d.querySelector('a[data-wa]')?.getAttribute('href') ?? '' };
    });
    checar('Modal: abre com galeria de fotos 2D', modal.aberto && modal.nome === 'iPhone 17 Pro Max' && modal.fotos === 3, `${modal.fotos} fotos`);
    checar('Modal: mostra as formas de pagamento', /Pix/.test(modal.pagamento) && /débito/.test(modal.pagamento) && /Dinheiro/.test(modal.pagamento) && /em até 18x \(com juros\)/.test(modal.pagamento));
    checar('Modal: mesmo CTA do card', decodeURIComponent(modal.href.split('text=')[1] ?? '') === 'Olá! Tenho interesse no iPhone 17 Pro Max 256 GB (Lacrado) que vi no site.', decodeURIComponent(modal.href.split('text=')[1] ?? ''));
    await pagina.screenshot({ path: join(SAIDA, '375-09-modal.png') });
    await pagina.keyboard.press('Escape');
    await pagina.waitForTimeout(300);
    checar('Modal: Esc fecha e o foco volta ao card', await pagina.evaluate(() => !document.getElementById('modal-produto').open && document.activeElement?.matches('[data-abrir="iphone-17-pro-max"]')));

    /* ---- Entrega ---- */
    await pagina.locator('#entrega').scrollIntoViewIfNeeded();
    await pagina.locator('label.chip', { hasText: 'Jales' }).click();
    const entrega = decodeURIComponent(((await pagina.locator('#entrega-cta').getAttribute('href')) ?? '').split('text=')[1] ?? '');
    checar('Entrega: a cidade escolhida entra na mensagem', entrega === 'Olá! Sou de Jales e quero saber como funciona a entrega.', entrega);
    checar('Entrega: as 8 cidades em chips', (await pagina.locator('#entrega label.chip').count()) === 8);

    /* ---- FAQ ---- */
    const faq = await pagina.evaluate(() => Array.from(document.querySelectorAll('.faq-lista summary')).map((s) => s.textContent.trim()));
    checar('FAQ: 4 perguntas, sem a de troca (não confirmada)', faq.length === 4 && !faq.some((p) => /troca/i.test(p)), faq.join(' | '));

    /* ---- Mapa: só carrega perto da tela ---- */
    await pagina.locator('#contato').scrollIntoViewIfNeeded();
    await pagina.waitForTimeout(1200);
    checar('Mapa: iframe criado só ao chegar no rodapé', (await pagina.locator('#mapa iframe').count()) === 1);

    /* ---- Rolagem no toque sobre o canvas ---- */
    await pagina.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await pagina.waitForTimeout(500);
    const cdp = await contexto.newCDPSession(pagina);
    const toque = (tipo, x, y) => cdp.send('Input.dispatchTouchEvent', { type: tipo, touchPoints: tipo === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
    const arrastar = async (x, y, dx, dy) => {
      await pagina.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await pagina.waitForTimeout(250);
      await toque('touchStart', x, y);
      for (let i = 1; i <= 15; i++) {
        await toque('touchMove', x + (dx * i) / 15, y + (dy * i) / 15);
        await pagina.waitForTimeout(16);
      }
      await toque('touchEnd');
      await pagina.waitForTimeout(450);
      return pagina.evaluate(() => Math.round(window.scrollY));
    };
    const caixa = await pagina.locator('#hero-canvas').boundingBox();
    const titulo = await pagina.locator('#titulo-hero').boundingBox();
    const px = Math.round(caixa.x + caixa.width / 2 + 25);
    const py = Math.round(caixa.y + caixa.height * 0.72);
    const controle = await arrastar(Math.round(titulo.x + 60), Math.round(titulo.y + titulo.height / 2), 0, -240);
    const vertical = await arrastar(px, py, 0, -240);
    checar('Toque: arrasto vertical sobre o aparelho rola a página', vertical > 100 && Math.abs(vertical - controle) <= 4, `canvas ${vertical} px, fora do canvas ${controle} px`);
    const antes = await pagina.evaluate(() => document.querySelector('[data-hotspot="camera"]').style.transform);
    const horizontal = await arrastar(px - 80, py, 170, 0);
    const depois = await pagina.evaluate(() => document.querySelector('[data-hotspot="camera"]').style.transform);
    checar('Toque: arrasto horizontal gira o aparelho sem rolar', horizontal === 0 && antes !== depois, `scrollY = ${horizontal}`);

    await capturarPagina(pagina, join(SAIDA, 'pagina-375.jpg'));
    await contexto.close();
  }

  /* =============== Nota de fora do horário (relógio simulado) =============== */
  for (const [rotulo, instante, esperado] of [
    ['domingo, 10:00', '2026-11-15T13:00:00Z', true],
    ['segunda, 10:00', '2026-11-16T13:00:00Z', false],
    ['segunda, 07:30', '2026-11-16T10:30:00Z', true],
    ['sábado, 17:59', '2026-11-14T20:59:00Z', false],
    ['sábado, 18:00', '2026-11-14T21:00:00Z', true],
  ]) {
    // fuso do visitante diferente de propósito: a conta tem de usar o horário de São Paulo
    const { contexto, pagina } = await novaPagina({ viewport: { width: 375, height: 812 }, timezoneId: 'Asia/Tokyo', reducedMotion: 'reduce' });
    await pagina.clock.setFixedTime(new Date(instante));
    await pagina.goto(URL_3D, { timeout: 120000 });
    await pagina.evaluate(() => document.getElementById('vitrine').scrollIntoView());
    await pagina.waitForTimeout(500);
    const visivel = await pagina.evaluate(() => !document.getElementById('wa-nota').hidden);
    const href = await pagina.locator('#wa-flutuante a').getAttribute('href');
    checar(`Fora do horário: ${rotulo} ${esperado ? 'mostra' : 'esconde'} "Respondemos a partir das 08:00"`, visivel === esperado && href.startsWith(`https://wa.me/${NUMERO}`));
    await contexto.close();
  }

  /* =============== Tablet (768 px) e desktop (1440 px) =============== */
  for (const [largura, altura] of [[768, 1024], [1440, 900]]) {
    const { contexto, pagina } = await novaPagina({ viewport: { width: largura, height: altura }, deviceScaleFactor: 1 });
    await pagina.goto(URL_3D, { timeout: 120000 });
    await esperar3D(pagina);
    checar(`${largura} px: sem rolagem horizontal`, await pagina.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
    // rola até o fim para as imagens com lazy loading carregarem antes do screenshot
    await pagina.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
        window.scrollTo({ top: y, behavior: 'instant' });
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    await pagina.waitForTimeout(1200);
    await capturarPagina(pagina, join(SAIDA, `pagina-${largura}.jpg`));
    if (largura === 1440) {
      const colunas = await pagina.evaluate(() => getComputedStyle(document.getElementById('grade-destaques')).gridTemplateColumns.split(' ').length);
      checar('1440 px: "Mais vendidos" vira grade', colunas === 3, `${colunas} colunas`);
      const ordem = await pagina.evaluate(() => Array.from(document.querySelectorAll('#grade-destaques .card-nome')).map((n) => n.textContent.trim()).join(', '));
      checar('Mais vendidos: 9 modelos na ordem oficial', ordem === 'iPhone 18 Pro Max, iPhone 18 Pro, iPhone 17 Pro Max, iPhone 15 Pro Max, iPhone 14 Pro Max, iPhone 14 Pro, iPhone 14, iPhone 13 Pro, iPhone 13', ordem);
      // teclado: Tab chega ao seletor de cores e aos hotspots
      const focaveis = await pagina.evaluate(() => Array.from(document.querySelectorAll('.hotspot, input[name="hero-cor"]')).every((el) => el.tabIndex >= 0));
      checar('Teclado: seletor de cores e hotspots são focáveis', focaveis);
    }
    await contexto.close();
  }

  /* =============== Bundle =============== */
  const estaticos = readdirSync(join(raiz, 'dist/static'));
  const html = readFileSync(join(raiz, 'dist/index.html'), 'utf8');
  const jsInicial = estaticos.filter((f) => f.endsWith('.js') && html.includes(f));
  const comThree = jsInicial.filter((f) => readFileSync(join(raiz, 'dist/static', f), 'utf8').includes('WebGLRenderer'));
  checar('Bundle: o Three.js não entra no JavaScript inicial', jsInicial.length > 0 && comThree.length === 0, jsInicial.join(', '));
  checar('Build: assets/ (originais) não vai para dist/', !existsSync(join(raiz, 'dist/assets')));
} finally {
  await navegador.close();
  await servidor.close();
}

checar('Nenhum erro no console', erros.length === 0, [...new Set(erros)].slice(0, 4).join(' | '));
const falhas = resultados.filter((r) => !r.ok);
console.log(`\n${resultados.length - falhas.length} de ${resultados.length} verificações passaram. Screenshots em docs/fase-7/`);
process.exit(falhas.length ? 1 : 0);
