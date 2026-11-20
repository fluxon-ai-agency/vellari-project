import './pagina.css';
import { lojaAberta } from '../../lib/horario.ts';
import { linkOrigem } from '../../lib/whatsapp.ts';

/** Entrega: a cidade escolhida entra na mensagem do WhatsApp. */
function initEntrega(): void {
  const cta = document.getElementById('entrega-cta') as HTMLAnchorElement | null;
  if (!cta) return;
  document.querySelectorAll<HTMLInputElement>('input[name="cidade"]').forEach((r) =>
    r.addEventListener('change', () => {
      if (r.checked) cta.href = linkOrigem('entrega', { cidade: r.value });
    }),
  );
}

/** Mapa do Google: o iframe só é criado quando o rodapé chega perto da tela. */
function initMapa(): void {
  const caixa = document.getElementById('mapa');
  const src = caixa?.dataset.src;
  if (!caixa || !src || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(
    (entradas) => {
      if (!entradas.some((x) => x.isIntersecting)) return;
      io.disconnect();
      const f = document.createElement('iframe');
      f.src = src;
      f.title = 'Mapa da Vellari Phone em Santa Fé do Sul';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      caixa.append(f);
    },
    { rootMargin: '300px' },
  );
  io.observe(caixa);
}

/** Botão flutuante: aparece quando o CTA do hero sai da tela e avisa fora do horário. */
function initFlutuante(): void {
  const caixa = document.getElementById('wa-flutuante');
  const nota = document.getElementById('wa-nota');
  const botao = caixa?.querySelector<HTMLAnchorElement>('.wa-botao');
  const ctaHero = document.getElementById('hero-cta');
  if (!caixa || !botao) return;

  /* Fora do horário (domingo, antes das 08:00 ou depois das 18:00, fuso de São Paulo) o botão
     segue funcionando e mostra a nota. Para não cobrir conteúdo no celular, ela aparece por
     alguns segundos quando o botão surge e de novo ao passar o mouse ou focar o botão. */
  let jaMostrou = false;
  let relogio = 0;
  const mostrarNota = (duracao?: number) => {
    if (!nota || lojaAberta()) return;
    nota.hidden = false;
    window.clearTimeout(relogio);
    if (duracao) relogio = window.setTimeout(() => (nota.hidden = true), duracao);
  };
  const esconderNota = () => {
    window.clearTimeout(relogio);
    if (nota) nota.hidden = true;
  };
  const aoAparecer = () => {
    if (jaMostrou) return;
    jaMostrou = true;
    mostrarNota(8000);
  };
  if (!lojaAberta()) botao.setAttribute('aria-describedby', 'wa-nota'); // leitores de tela leem a nota junto

  botao.addEventListener('mouseenter', () => mostrarNota());
  botao.addEventListener('focus', () => mostrarNota());
  botao.addEventListener('mouseleave', esconderNota);
  botao.addEventListener('blur', esconderNota);

  const definir = (visivel: boolean) => {
    caixa.dataset.visivel = visivel ? '1' : '0';
    if (visivel) aoAparecer();
  };
  // Só aparece depois que o CTA do hero sai da tela
  if (ctaHero && 'IntersectionObserver' in window) {
    new IntersectionObserver((entradas) => definir(!entradas.some((x) => x.isIntersecting))).observe(ctaHero);
  } else {
    definir(true);
  }
}

/** Animações de entrada suaves e discretas. Desligadas com "reduzir movimento". */
function initRevelar(): void {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const alvos = document.querySelectorAll<HTMLElement>(
    '.cabecalho-secao, .beneficio, .grade-destaques > *, .grade-produtos > *, .motivo, .loja-fisica, .clientes > li, .entrega-acao, .faq-lista details, .cta-final-inner',
  );
  // Só anima o que ainda está fora da tela. A primeira notificação de cada alvo diz onde ele
  // está, sem forçar o navegador a calcular o layout da página inteira.
  const conhecidos = new WeakSet<Element>();
  const io = new IntersectionObserver(
    (entradas) => {
      const entrando: HTMLElement[] = [];
      for (const x of entradas) {
        const primeira = !conhecidos.has(x.target);
        conhecidos.add(x.target);
        if (!x.isIntersecting) continue;
        if (!primeira) entrando.push(x.target as HTMLElement);
        io.unobserve(x.target);
      }
      // O que entra junto sobe em sequência, na ordem da página (no máximo 6 degraus)
      entrando.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      entrando.forEach((el, i) => {
        el.style.setProperty('--atraso', `${Math.min(i, 6) * 70}ms`);
        el.classList.add('revelar', 'entrando');
      });
    },
    { threshold: 0.12 },
  );
  alvos.forEach((el) => io.observe(el));
}

export function initPagina(): void {
  initEntrega();
  initMapa();
  initFlutuante();
  initRevelar();
  const ano = document.getElementById('ano');
  if (ano) ano.textContent = String(new Date().getFullYear());
}
