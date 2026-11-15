import { CATEGORIAS, CONDICOES, maisVendidos, PRODUTOS } from '../../data/products.ts';
import { linkOrigem } from '../../lib/whatsapp.ts';
import { esc, icone } from '../../render/html.ts';
import { cardProduto, modalProduto } from './card.ts';

const ICONE_CATEGORIA: Record<string, string> = {
  Todos: 'grade',
  iPhone: 'celular',
  Android: 'celular',
  'Acessórios': 'plug',
  Smartwatch: 'smartwatch',
  Fones: 'fone',
  Outros: 'caixa-som',
};
const PLURAL: Record<string, string> = { iPhone: 'iPhones', Smartwatch: 'Smartwatches' };

/** Seção "Mais vendidos": carrossel com arrasto no celular, grade no desktop. */
export function maisVendidosSection(): string {
  const cards = maisVendidos()
    .map((p, i) => cardProduto(p, { grande: true, selo: 'Mais vendido', ordem: i }))
    .join('');
  return `
<section class="secao" id="mais-vendidos" aria-labelledby="titulo-mais-vendidos">
  <div class="container">
    <div class="cabecalho-secao">
      <p class="selo-phone">Mais vendidos</p>
      <h2 class="t-h2" id="titulo-mais-vendidos">Os iPhones que mais saem da loja</h2>
      <p class="lead">Escolha o modelo e chame no WhatsApp. A gente passa valores, cores e condições na hora.</p>
    </div>
    <div class="grade-destaques" id="grade-destaques" tabindex="0" role="group" aria-label="iPhones mais vendidos. Deslize para ver todos">
      ${cards}
    </div>
  </div>
</section>`;
}

/** Vitrine completa: filtros por categoria e condição, busca e ordenação. */
export function vitrineSection(): string {
  // Só mostra as categorias que têm produto
  const categorias = CATEGORIAS.filter((c) => PRODUTOS.some((p) => p.categoria === c));
  const chip = (attr: string, valor: string, rotulo: string, ativo: boolean, comIcone = true) =>
    `<button class="cat" type="button" ${attr}="${esc(valor)}" aria-pressed="${ativo}">${comIcone ? icone(ICONE_CATEGORIA[valor] ?? 'grade') : ''}${esc(rotulo)}</button>`;

  const total = PRODUTOS.length;
  return `
<section class="secao" id="vitrine" aria-labelledby="titulo-vitrine">
  <div class="container">
    <div class="cabecalho-secao">
      <p class="selo-phone">Vitrine</p>
      <h2 class="t-h2" id="titulo-vitrine">Tudo o que tem na loja</h2>
      <p class="lead">iPhones lacrados e seminovos, Android, smartwatches e acessórios. Toque em um produto para ver as fotos.</p>
    </div>
    <div class="ferramentas">
      <div class="busca">
        <label class="sr-only" for="busca">Buscar produto pelo nome</label>
        ${icone('busca')}
        <input id="busca" type="search" placeholder="Buscar iPhone 14, Redmi, JBL…" autocomplete="off" enterkeyhint="search">
      </div>
      <div class="categorias" id="categorias" role="group" aria-label="Filtrar por categoria">
        ${chip('data-cat', 'Todos', 'Todos', true)}
        ${categorias.map((c) => chip('data-cat', c, PLURAL[c] ?? c, false)).join('')}
      </div>
      <div class="linha-filtros">
        <div class="condicoes" id="condicoes" role="group" aria-label="Filtrar por condição">
          ${chip('data-cond', 'Todos', 'Todas as condições', true, false)}
          ${CONDICOES.map((c) => chip('data-cond', c, c, false, false)).join('')}
        </div>
        <div class="ordenar">
          <label for="ordenar">Ordenar por</label>
          <select id="ordenar">
            <option value="destaque">Destaques</option>
            <option value="nome">Nome (A a Z)</option>
            <option value="preco-menor">Menor preço</option>
            <option value="preco-maior">Maior preço</option>
          </select>
        </div>
      </div>
    </div>
    <p class="contagem" id="contagem" aria-live="polite">${total} produtos</p>
    <div class="grade-produtos" id="grade-produtos">
      ${PRODUTOS.map((p, i) => cardProduto(p, { ordem: i })).join('')}
    </div>
    <div class="vazio" id="vitrine-vazia" hidden>
      <h3 class="t-h4">Não achou o que procurava?</h3>
      <p class="texto-2">A vitrine mostra uma parte do estoque. Mande o modelo que você quer e a gente procura pra você.</p>
      <a class="btn btn-primario" data-wa="geral" data-wa-local="vitrine-vazia" href="${linkOrigem('geral')}" target="_blank" rel="noopener">${icone('whatsapp')}Perguntar no WhatsApp</a>
    </div>
  </div>
</section>`;
}

/** Modal do produto + um <template> por produto. */
export function modalSection(): string {
  return `
<dialog class="modal" id="modal-produto" aria-labelledby="mp-nome">
  <div class="modal-caixa">
    <button class="btn-icone fechar" type="button" data-fechar aria-label="Fechar">${icone('fechar')}</button>
    <div class="modal-conteudo" id="modal-conteudo"></div>
  </div>
</dialog>
${PRODUTOS.map(modalProduto).join('')}`;
}
