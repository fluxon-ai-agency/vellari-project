/* Card de produto e conteúdo do modal. Funções puras, usadas no build. */
import { condicaoComGarantia, type Produto, type Selo } from '../../data/products.ts';
import { store } from '../../data/store.ts';
import { linkOrigem } from '../../lib/whatsapp.ts';
import { esc, icone, picture, temImagem } from '../../render/html.ts';

const CLASSE_SELO: Record<Selo, string> = {
  'Mais vendido': 'selo-mais-vendido',
  'Lançamento': 'selo-lancamento',
  'Últimas unidades': 'selo-ultimas',
};

const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: Number.isInteger(v) ? 0 : 2 }).format(v);

/** Texto sem acento e em minúsculas, para a busca. */
export const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Mensagem pronta do WhatsApp para o produto. */
export function linkProduto(p: Produto): string {
  return linkOrigem('produto', { nome: p.nome, armazenamento: p.armazenamento, cor: p.cor, 'condição': p.condicao });
}

function detalhes(p: Produto): string {
  return [p.armazenamento, p.cor].filter(Boolean).join(' • ') || 'Consulte cores e armazenamento';
}

function selo(s: Selo | null): string {
  return s ? `<span class="selo ${CLASSE_SELO[s]}">${esc(s)}</span>` : '';
}

function preco(p: Produto): string {
  // Sem preço confirmado pela loja: "Consulte". O parcelamento é sempre "em até 18x (com juros)".
  const valor = typeof p.preco === 'number' ? `<span class="preco">${brl(p.preco)}</span>` : '<span class="preco-consulte">Consulte</span>';
  return `${valor}<span class="parcela">${esc(store.pagamento.parcelamento)}</span>`;
}

/** Placeholder neutro para produto sem foto oficial em assets/. */
function semFoto(p: Produto): string {
  return `<div class="sem-foto" role="img" aria-label="${esc(p.nome)}: foto em breve">${icone('celular')}<span>Foto em breve</span></div>`;
}

function fotos(p: Produto): string[] {
  return p.imagens.filter(temImagem);
}

const botaoWhats = (p: Produto, local: string, classe: string) => `
  <a class="${classe}" data-wa="produto" data-wa-local="${local}" data-wa-produto="${esc(p.nome)}" href="${linkProduto(p)}" target="_blank" rel="noopener"
     aria-label="Quero este: ${esc(p.nome)}. Abre o WhatsApp">${icone('whatsapp')}Quero este</a>`;

interface OpcoesCard {
  /** Card grande da seção "Mais vendidos". */
  grande?: boolean;
  /** Força um selo (em "Mais vendidos" todos levam o mesmo). */
  selo?: Selo;
  ordem: number;
}

export function cardProduto(p: Produto, o: OpcoesCard): string {
  const imagens = fotos(p);
  const sizes = o.grande ? '(min-width: 1024px) 380px, (min-width: 760px) 46vw, 80vw' : '(min-width: 1100px) 290px, (min-width: 900px) 31vw, 46vw';
  const busca = normalizar([p.nome, p.modelo, p.categoria, p.condicao, p.armazenamento ?? '', p.cor ?? ''].join(' '));
  const primeira = imagens[0];
  return `
<article class="card-produto${o.grande ? ' grande' : ''}" data-produto="${p.id}" data-categoria="${esc(p.categoria)}" data-condicao="${p.condicao}"
  data-busca="${esc(busca)}" data-nome="${esc(normalizar(p.nome))}" data-preco="${p.preco ?? ''}" data-ordem="${o.ordem}">
  <div class="card-midia">
    ${selo(o.selo ?? p.selo)}
    ${primeira ? picture(primeira, { sizes }) : semFoto(p)}
  </div>
  <div class="card-corpo">
    <h3 class="card-nome"><button class="card-link" type="button" data-abrir="${p.id}" aria-haspopup="dialog">${esc(p.nome)}</button></h3>
    <p class="card-opcoes">${esc(detalhes(p))}</p>
    <p class="card-condicao">${esc(condicaoComGarantia(p))}</p>
    <div class="card-preco">${preco(p)}</div>
    <div class="card-acoes">${botaoWhats(p, o.grande ? 'mais-vendidos' : 'vitrine', 'btn btn-escuro')}</div>
  </div>
</article>`;
}

/** Conteúdo do modal de um produto, guardado em <template> (as fotos só carregam ao abrir). */
export function modalProduto(p: Produto): string {
  const imagens = fotos(p);
  const sizes = '(min-width: 760px) 460px, 94vw';
  const galeria = imagens.length
    ? imagens.map((id, i) => `<figure class="mp-foto" aria-label="Foto ${i + 1} de ${imagens.length}">${picture(id, { sizes })}</figure>`).join('')
    : `<figure class="mp-foto">${semFoto(p)}</figure>`;
  const navegacao =
    imagens.length > 1
      ? `<div class="mp-nav">
          <button class="btn-icone" type="button" data-galeria="-1" aria-label="Foto anterior">${icone('seta-esquerda')}</button>
          <span class="mp-contador" aria-live="polite"><span data-atual>1</span> / ${imagens.length}</span>
          <button class="btn-icone" type="button" data-galeria="1" aria-label="Próxima foto">${icone('seta-direita')}</button>
        </div>`
      : '';
  return `
<template data-modal="${p.id}">
  <div class="mp-midia">
    ${selo(p.selo)}
    <div class="mp-galeria" tabindex="0" role="group" aria-label="Fotos de ${esc(p.nome)}">${galeria}</div>
    ${navegacao}
  </div>
  <div class="mp-info">
    <div class="mp-topo">
      <h2 class="t-h3" id="mp-nome">${esc(p.nome)}</h2>
      <p class="mp-resumo">${esc(detalhes(p))}</p>
      <p class="mp-condicao">${icone('escudo', 'ic ic-16')}${esc(condicaoComGarantia(p))}</p>
    </div>
    <div class="mp-preco">${preco(p)}</div>
    <div class="mp-pagamento">
      <h3>Formas de pagamento</h3>
      <ul>
        <li>${icone('check', 'ic ic-16')}Pix</li>
        <li>${icone('check', 'ic ic-16')}Cartão de débito</li>
        <li>${icone('check', 'ic ic-16')}Dinheiro</li>
        <li>${icone('check', 'ic ic-16')}Cartão de crédito ${esc(store.pagamento.parcelamento)}</li>
      </ul>
    </div>
    ${botaoWhats(p, 'modal', 'btn btn-primario btn-g btn-bloco')}
    <p class="mp-nota">Você fala direto com a loja e fecha tudo pelo WhatsApp.</p>
  </div>
</template>`;
}
