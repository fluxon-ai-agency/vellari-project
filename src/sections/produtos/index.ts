import './produtos.css';

/* Os cards já vêm prontos no HTML. Aqui só entram filtros, busca, ordenação e o modal. */

const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function initVitrine(): void {
  const grade = document.getElementById('grade-produtos');
  const contagem = document.getElementById('contagem');
  const vazia = document.getElementById('vitrine-vazia');
  const busca = document.getElementById('busca') as HTMLInputElement | null;
  const ordenar = document.getElementById('ordenar') as HTMLSelectElement | null;
  if (!grade || !contagem || !vazia) return;

  const cards = Array.from(grade.querySelectorAll<HTMLElement>('.card-produto'));
  const filtro = { categoria: 'Todos', condicao: 'Todos', busca: '' };

  function aplicar(): void {
    const termos = normalizar(filtro.busca).split(/\s+/).filter(Boolean);
    let visiveis = 0;
    for (const card of cards) {
      const ok =
        (filtro.categoria === 'Todos' || card.dataset.categoria === filtro.categoria) &&
        (filtro.condicao === 'Todos' || card.dataset.condicao === filtro.condicao) &&
        termos.every((t) => (card.dataset.busca ?? '').includes(t));
      card.hidden = !ok;
      if (ok) visiveis++;
    }
    contagem!.textContent = visiveis === 1 ? '1 produto' : `${visiveis} produtos`;
    vazia!.hidden = visiveis > 0;
  }

  function reordenar(criterio: string): void {
    const preco = (c: HTMLElement) => (c.dataset.preco ? Number(c.dataset.preco) : null);
    const ordem = (c: HTMLElement) => Number(c.dataset.ordem);
    const porPreco = (sentido: 1 | -1) => (a: HTMLElement, b: HTMLElement) => {
      const pa = preco(a);
      const pb = preco(b);
      if (pa === null && pb === null) return ordem(a) - ordem(b);
      if (pa === null) return 1; // "Consulte" vai para o fim
      if (pb === null) return -1;
      return (pa - pb) * sentido || ordem(a) - ordem(b);
    };
    const comparar =
      criterio === 'nome'
        ? (a: HTMLElement, b: HTMLElement) => (a.dataset.nome ?? '').localeCompare(b.dataset.nome ?? '', 'pt-BR', { numeric: true })
        : criterio === 'preco-menor'
          ? porPreco(1)
          : criterio === 'preco-maior'
            ? porPreco(-1)
            : (a: HTMLElement, b: HTMLElement) => ordem(a) - ordem(b);
    cards.sort(comparar).forEach((c) => grade!.appendChild(c));
  }

  const grupo = (id: string, attr: 'cat' | 'cond', chave: 'categoria' | 'condicao') => {
    const caixa = document.getElementById(id);
    caixa?.addEventListener('click', (e) => {
      const botao = (e.target as Element).closest<HTMLButtonElement>(`[data-${attr}]`);
      if (!botao) return;
      filtro[chave] = botao.dataset[attr] ?? 'Todos';
      caixa.querySelectorAll('.cat').forEach((b) => b.setAttribute('aria-pressed', String(b === botao)));
      aplicar();
    });
  };
  grupo('categorias', 'cat', 'categoria');
  grupo('condicoes', 'cond', 'condicao');
  busca?.addEventListener('input', () => {
    filtro.busca = busca.value;
    aplicar();
  });
  ordenar?.addEventListener('change', () => reordenar(ordenar.value));
}

function initModal(): void {
  const modal = document.getElementById('modal-produto') as HTMLDialogElement | null;
  const conteudo = document.getElementById('modal-conteudo');
  if (!modal || !conteudo || typeof modal.showModal !== 'function') return;
  let quemAbriu: HTMLElement | null = null;

  function abrir(id: string, origem: HTMLElement): void {
    const molde = document.querySelector<HTMLTemplateElement>(`template[data-modal="${CSS.escape(id)}"]`);
    if (!molde) return;
    quemAbriu = origem;
    conteudo!.replaceChildren(molde.content.cloneNode(true));
    modal!.showModal();
    modal!.querySelector<HTMLElement>('.fechar')?.focus();
    ligarGaleria();
  }

  /** Galeria de fotos 2D: desliza com o dedo; setas e contador quando há mais de uma foto. */
  function ligarGaleria(): void {
    const galeria = conteudo!.querySelector<HTMLElement>('.mp-galeria');
    const atual = conteudo!.querySelector<HTMLElement>('[data-atual]');
    if (!galeria) return;
    const indice = () => Math.round(galeria.scrollLeft / Math.max(galeria.clientWidth, 1));
    const ir = (i: number) => galeria.scrollTo({ left: i * galeria.clientWidth, behavior: 'smooth' });
    galeria.addEventListener('scroll', () => atual && (atual.textContent = String(indice() + 1)), { passive: true });
    galeria.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') ir(indice() + 1);
      if (e.key === 'ArrowLeft') ir(indice() - 1);
    });
    conteudo!.querySelectorAll<HTMLButtonElement>('[data-galeria]').forEach((b) => b.addEventListener('click', () => ir(indice() + Number(b.dataset.galeria))));
  }

  document.addEventListener('click', (e) => {
    const botao = (e.target as Element).closest<HTMLElement>('[data-abrir]');
    if (botao?.dataset.abrir) abrir(botao.dataset.abrir, botao);
  });
  modal.addEventListener('click', (e) => {
    const alvo = e.target as Element;
    if (alvo === modal || alvo.closest('[data-fechar]')) modal.close(); // clique fora da caixa ou no X
  });
  modal.addEventListener('close', () => {
    conteudo.replaceChildren();
    quemAbriu?.focus();
    quemAbriu = null;
  });
}

export function initProdutos(): void {
  initVitrine();
  initModal();
}
