/* Lighthouse mobile sobre o build de produção (dist/).

   Uso: npm run lighthouse            (roda "npm run build" antes)
        npm run lighthouse -- --janela   abre o Chrome com janela
   Saída: docs/fase-7/lighthouse.html, lighthouse.json e o resumo no terminal.

   Metas: Performance >= 85, Acessibilidade >= 95, Boas práticas >= 95, SEO 100,
          LCP < 2,5 s e CLS < 0,1.

   Calibração: o Lighthouse simula um celular intermediário deixando a CPU 4x mais lenta, o que
   pressupõe um computador rápido (índice de benchmark perto de 1500). Em máquina lenta a conta
   passa do ponto, então o script lê o índice medido e ajusta o multiplicador com a mesma tabela
   da calculadora oficial (https://lighthouse-cpu-throttling-calculator.vercel.app). */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import { preview } from 'vite';
import { raiz } from './_navegador.mjs';

const SAIDA = join(raiz, 'docs/fase-7');
mkdirSync(SAIDA, { recursive: true });
if (!existsSync(join(raiz, 'dist/index.html'))) {
  console.error('dist/ não existe. Rode "npm run build" antes.');
  process.exit(1);
}

const METAS = { performance: 85, accessibility: 95, 'best-practices': 95, seo: 100 };
const NOMES = { performance: 'Performance', accessibility: 'Acessibilidade', 'best-practices': 'Boas práticas', seo: 'SEO' };
const REDE_4G_LENTA = { rttMs: 150, throughputKbps: 1638.4, requestLatencyMs: 562.5, downloadThroughputKbps: 1474.56, uploadThroughputKbps: 675 };

/** Multiplicador de CPU que faz ESTA máquina se comportar como um celular intermediário. */
function multiplicadorPara(indice) {
  if (!Number.isFinite(indice) || indice >= 1300) return 4; // máquina rápida: padrão do Lighthouse
  if (indice >= 800) return 2 + (indice - 800) / 500;
  if (indice >= 150) return 1 + (indice - 150) / 650;
  return 1;
}

const comJanela = process.argv.includes('--janela');
const servidor = await preview({ root: raiz, logLevel: 'error', preview: { port: 4198, strictPort: false } });
const url = servidor.resolvedUrls?.local[0] ?? 'http://localhost:4198/';
let chrome = null;

// Se o Lighthouse cair no meio, o Chrome aberto por ele não pode ficar para trás
const encerrar = async (codigo) => {
  try {
    await chrome?.kill();
    await servidor.close();
  } finally {
    process.exit(codigo);
  }
};
process.on('uncaughtException', (erro) => {
  console.error(`Lighthouse não terminou: ${erro.code ?? erro.message}. A máquina pode estar sobrecarregada; feche outros programas e tente de novo.`);
  void encerrar(1);
});

async function medir(multiplicador) {
  chrome = await chromeLauncher.launch({ chromeFlags: comJanela ? ['--window-size=500,900'] : ['--headless=new'] });
  try {
    const { lhr, report } = await lighthouse(url, {
      port: chrome.port,
      output: ['html', 'json'],
      logLevel: 'error',
      onlyCategories: Object.keys(METAS),
      locale: 'pt',
      maxWaitForLoad: 60000,
      throttlingMethod: 'simulate',
      throttling: { ...REDE_4G_LENTA, cpuSlowdownMultiplier: multiplicador },
    });
    return { lhr, report };
  } finally {
    await chrome.kill();
    chrome = null;
  }
}

let { lhr, report } = await medir(4);
if (lhr.runtimeError) {
  console.error(`Lighthouse não conseguiu medir a página: ${lhr.runtimeError.code}. ${lhr.runtimeError.message}`);
  await encerrar(1);
}
const indice = lhr.environment.benchmarkIndex;
let multiplicador = 4;
const recomendado = Math.round(multiplicadorPara(indice) * 10) / 10;
if (recomendado < 3.5) {
  console.log(`Máquina lenta (índice de benchmark ${Math.round(indice)}; o padrão de 4x pressupõe ~1500).`);
  console.log(`Medindo de novo com a CPU calibrada em ${recomendado}x, como a calculadora do Lighthouse recomenda.\n`);
  const nova = await medir(recomendado);
  if (!nova.lhr.runtimeError) {
    ({ lhr, report } = nova);
    multiplicador = recomendado;
  }
}
writeFileSync(join(SAIDA, 'lighthouse.html'), report[0]);
writeFileSync(join(SAIDA, 'lighthouse.json'), report[1]);

let falhou = false;
const nota = (id) => Math.round((lhr.categories[id]?.score ?? 0) * 100);
const valor = (id) => lhr.audits[id]?.numericValue ?? NaN;
console.log(`Lighthouse mobile · ${comJanela ? 'Chrome com janela' : 'Chrome sem interface'} · 4G lento · CPU ${multiplicador}x · índice da máquina ${Math.round(lhr.environment.benchmarkIndex)}`);
for (const [id, meta] of Object.entries(METAS)) {
  const n = nota(id);
  if (n < meta) falhou = true;
  console.log(`${n >= meta ? '✓' : '✗'} ${NOMES[id]}: ${n} (meta ${meta})`);
}
const lcp = valor('largest-contentful-paint') / 1000;
const cls = valor('cumulative-layout-shift');
if (!(lcp < 2.5) || !(cls < 0.1)) falhou = true;
console.log(`${lcp < 2.5 ? '✓' : '✗'} LCP: ${lcp.toFixed(2)} s (meta < 2,5 s)`);
console.log(`${cls < 0.1 ? '✓' : '✗'} CLS: ${cls.toFixed(3)} (meta < 0,1)`);
console.log(`  FCP ${(valor('first-contentful-paint') / 1000).toFixed(2)} s · TBT ${Math.round(valor('total-blocking-time'))} ms · Speed Index ${(valor('speed-index') / 1000).toFixed(2)} s`);

// O que ainda tira ponto, por categoria
for (const id of Object.keys(METAS)) {
  const reprovados = lhr.categories[id].auditRefs
    .filter((ref) => ref.weight > 0)
    .map((ref) => lhr.audits[ref.id])
    .filter((a) => a && a.score !== null && a.score < 0.9);
  if (reprovados.length) console.log(`  ${NOMES[id]}, a melhorar: ${reprovados.map((a) => `${a.id}${a.displayValue ? ` (${a.displayValue})` : ''}`).join('; ')}`);
}
console.log('Relatório completo: docs/fase-7/lighthouse.html');
await encerrar(falhou ? 1 : 0);
