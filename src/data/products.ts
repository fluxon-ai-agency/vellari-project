/* =====================================================================
   CATÁLOGO DA VITRINE
   Para adicionar um produto, copie um bloco e edite.

   id            texto único, sem espaço (ex.: "iphone-14-128")
   nome          nome que aparece no card
   categoria     "iPhone" | "Android" | "Acessórios" | "Smartwatch" | "Fones" | "Outros"
   modelo        modelo, sem armazenamento nem cor
   armazenamento ex.: "128 GB" (em relógio, o tamanho). null = "consulte"
   cor           nome da cor. null = "consulte"
   condicao      "Lacrado" | "Seminovo"
   preco         número (ex.: 3499) ou null, que exibe "Consulte"
   imagens       ids de src/data/image-sources.json. [] = placeholder neutro
   selo          "Mais vendido" | "Lançamento" | "Últimas unidades" | null
   destaque      true = entra em "Mais vendidos" (a ordem vem de store.maisVendidos)
   confirmar     o que a loja ainda precisa confirmar (vai para o relatório)

   Regras: nunca invente preço nem especificação. O catálogo inicial foi
   montado a partir das fotos de assets/; armazenamento e cor vêm do texto
   do próprio story da loja.
   ===================================================================== */
import { store } from './store.ts';

export type Categoria = 'iPhone' | 'Android' | 'Acessórios' | 'Smartwatch' | 'Fones' | 'Outros';
export type Condicao = 'Lacrado' | 'Seminovo';
export type Selo = 'Mais vendido' | 'Lançamento' | 'Últimas unidades';

export interface Produto {
  id: string;
  nome: string;
  categoria: Categoria;
  modelo: string;
  armazenamento: string | null;
  cor: string | null;
  condicao: Condicao;
  preco: number | null;
  imagens: string[];
  selo: Selo | null;
  destaque: boolean;
  confirmar?: string[];
}

export const CATEGORIAS: Categoria[] = ['iPhone', 'Android', 'Acessórios', 'Smartwatch', 'Fones', 'Outros'];
export const CONDICOES: Condicao[] = ['Lacrado', 'Seminovo'];

/** Garantia derivada da condição. A loja só confirmou a garantia dos iPhones;
    para as outras categorias devolve null até a loja informar. */
export function garantiaDe(p: Pick<Produto, 'categoria' | 'condicao'>): string | null {
  return p.categoria === 'iPhone' ? store.garantia[p.condicao] : null;
}

/** "Seminovo • 3 meses de garantia" */
export function condicaoComGarantia(p: Pick<Produto, 'categoria' | 'condicao'>): string {
  const g = garantiaDe(p);
  return g ? `${p.condicao} • ${g}` : p.condicao;
}

const ESTOQUE = 'armazenamentos e cores em estoque';
const SEM_FOTO = 'falta foto oficial em assets/';
const CONDICAO = 'condição (Lacrado ou Seminovo)';

export const PRODUTOS: Produto[] = [
  /* ---------- Mais vendidos (ordem oficial em store.maisVendidos) ---------- */
  {
    id: 'iphone-18-pro-max', nome: 'iPhone 18 Pro Max', categoria: 'iPhone', modelo: 'iPhone 18 Pro Max',
    armazenamento: null, cor: null, condicao: 'Lacrado', preco: null,
    imagens: [], selo: 'Lançamento', destaque: true, confirmar: [SEM_FOTO, ESTOQUE],
  },
  {
    id: 'iphone-18-pro', nome: 'iPhone 18 Pro', categoria: 'iPhone', modelo: 'iPhone 18 Pro',
    armazenamento: null, cor: null, condicao: 'Lacrado', preco: null,
    imagens: [], selo: 'Lançamento', destaque: true, confirmar: [SEM_FOTO, ESTOQUE],
  },
  {
    id: 'iphone-17-pro-max', nome: 'iPhone 17 Pro Max', categoria: 'iPhone', modelo: 'iPhone 17 Pro Max',
    armazenamento: '256 GB', cor: null, condicao: 'Lacrado', preco: null,
    imagens: ['iphone-17-pro-max', 'iphone-17-pro-max-cores', 'iphone-17-pro-max-laranja'],
    selo: 'Mais vendido', destaque: true, confirmar: ['cores em estoque'],
  },
  {
    id: 'iphone-15-pro-max', nome: 'iPhone 15 Pro Max', categoria: 'iPhone', modelo: 'iPhone 15 Pro Max',
    armazenamento: null, cor: null, condicao: 'Seminovo', preco: null,
    imagens: [], selo: 'Mais vendido', destaque: true, confirmar: [SEM_FOTO, ESTOQUE, CONDICAO],
  },
  {
    id: 'iphone-14-pro-max', nome: 'iPhone 14 Pro Max', categoria: 'iPhone', modelo: 'iPhone 14 Pro Max',
    armazenamento: '256 GB', cor: 'Prateado', condicao: 'Seminovo', preco: null,
    imagens: ['iphone-14-pro-max'], selo: 'Mais vendido', destaque: true, confirmar: [ESTOQUE],
  },
  {
    id: 'iphone-14-pro', nome: 'iPhone 14 Pro', categoria: 'iPhone', modelo: 'iPhone 14 Pro',
    armazenamento: null, cor: null, condicao: 'Seminovo', preco: null,
    imagens: [], selo: 'Mais vendido', destaque: true, confirmar: [SEM_FOTO, ESTOQUE, CONDICAO],
  },
  {
    id: 'iphone-14', nome: 'iPhone 14', categoria: 'iPhone', modelo: 'iPhone 14',
    armazenamento: '128 GB', cor: 'Meia-noite', condicao: 'Seminovo', preco: null,
    imagens: ['iphone-14', 'iphone-14-roxo'], selo: 'Mais vendido', destaque: true, confirmar: [ESTOQUE],
  },
  {
    id: 'iphone-13-pro', nome: 'iPhone 13 Pro', categoria: 'iPhone', modelo: 'iPhone 13 Pro',
    armazenamento: '128 GB', cor: 'Prateado', condicao: 'Seminovo', preco: null,
    imagens: ['iphone-13-pro'], selo: 'Mais vendido', destaque: true, confirmar: [ESTOQUE],
  },
  {
    id: 'iphone-13', nome: 'iPhone 13', categoria: 'iPhone', modelo: 'iPhone 13',
    armazenamento: '128 GB', cor: 'Azul', condicao: 'Seminovo', preco: null,
    imagens: ['iphone-13'], selo: 'Mais vendido', destaque: true, confirmar: [ESTOQUE],
  },

  /* ---------- Outros iPhones ---------- */
  {
    id: 'iphone-15-pro', nome: 'iPhone 15 Pro', categoria: 'iPhone', modelo: 'iPhone 15 Pro',
    armazenamento: '128 GB', cor: 'Titânio branco', condicao: 'Seminovo', preco: null,
    imagens: ['iphone-15-pro'], selo: null, destaque: false, confirmar: ['ainda em estoque?'],
  },
  {
    id: 'iphone-14-plus', nome: 'iPhone 14 Plus', categoria: 'iPhone', modelo: 'iPhone 14 Plus',
    armazenamento: '128 GB', cor: 'Meia-noite', condicao: 'Seminovo', preco: null,
    imagens: ['iphone-14-plus'], selo: null, destaque: false, confirmar: ['ainda em estoque?'],
  },
  {
    id: 'iphone-13-pro-max', nome: 'iPhone 13 Pro Max', categoria: 'iPhone', modelo: 'iPhone 13 Pro Max',
    armazenamento: '256 GB', cor: 'Dourado', condicao: 'Seminovo', preco: null,
    imagens: ['iphone-13-pro-max', 'iphone-13-pro-max-azul'], selo: null, destaque: false, confirmar: ['ainda em estoque?'],
  },
  {
    id: 'iphone-12', nome: 'iPhone 12', categoria: 'iPhone', modelo: 'iPhone 12',
    armazenamento: '128 GB', cor: 'Branco', condicao: 'Seminovo', preco: null,
    imagens: ['iphone-12'], selo: null, destaque: false, confirmar: ['ainda em estoque?'],
  },
  {
    id: 'iphone-11-pro-max', nome: 'iPhone 11 Pro Max', categoria: 'iPhone', modelo: 'iPhone 11 Pro Max',
    armazenamento: '256 GB', cor: 'Verde meia-noite', condicao: 'Seminovo', preco: null,
    imagens: ['iphone-11-pro-max'], selo: null, destaque: false, confirmar: ['ainda em estoque?'],
  },
  {
    id: 'iphone-11', nome: 'iPhone 11', categoria: 'iPhone', modelo: 'iPhone 11',
    armazenamento: null, cor: null, condicao: 'Seminovo', preco: null,
    imagens: ['iphone-11'], selo: null, destaque: false, confirmar: [ESTOQUE],
  },

  /* ---------- Android ---------- */
  {
    id: 'redmi-note-17', nome: 'Redmi Note 17', categoria: 'Android', modelo: 'Redmi Note 17',
    armazenamento: '256 GB', cor: null, condicao: 'Lacrado', preco: null,
    imagens: ['redmi-note-17'], selo: null, destaque: false, confirmar: ['cores em estoque', 'garantia'],
  },
  {
    id: 'redmi-note-14-pro', nome: 'Redmi Note 14 Pro 5G', categoria: 'Android', modelo: 'Redmi Note 14 Pro 5G',
    armazenamento: null, cor: null, condicao: 'Lacrado', preco: null,
    imagens: ['redmi-note-14-pro'], selo: null, destaque: false, confirmar: [ESTOQUE, 'garantia'],
  },
  {
    id: 'redmi-note-14', nome: 'Redmi Note 14', categoria: 'Android', modelo: 'Redmi Note 14',
    armazenamento: '256 GB', cor: null, condicao: 'Lacrado', preco: null,
    imagens: ['redmi-note-14'], selo: null, destaque: false, confirmar: ['cores em estoque', 'garantia'],
  },
  {
    id: 'redmi-14c', nome: 'Redmi 14C', categoria: 'Android', modelo: 'Redmi 14C',
    armazenamento: '256 GB', cor: null, condicao: 'Lacrado', preco: null,
    imagens: ['redmi-14c'], selo: null, destaque: false, confirmar: ['cores em estoque', 'garantia'],
  },
  {
    id: 'poco-x7-pro', nome: 'Poco X7 Pro', categoria: 'Android', modelo: 'Poco X7 Pro',
    armazenamento: null, cor: null, condicao: 'Lacrado', preco: null,
    imagens: ['poco-x7-pro'], selo: null, destaque: false, confirmar: [ESTOQUE, 'garantia'],
  },
  {
    id: 'realme-c73', nome: 'Realme C73', categoria: 'Android', modelo: 'Realme C73',
    armazenamento: '256 GB', cor: null, condicao: 'Lacrado', preco: null,
    imagens: ['realme-c73'], selo: null, destaque: false, confirmar: ['cores em estoque', 'garantia'],
  },
  {
    id: 'realme-c63', nome: 'Realme C63', categoria: 'Android', modelo: 'Realme C63',
    armazenamento: null, cor: null, condicao: 'Lacrado', preco: null,
    imagens: ['realme-c63'], selo: null, destaque: false, confirmar: [ESTOQUE, 'garantia'],
  },

  /* ---------- Smartwatch ---------- */
  {
    id: 'apple-watch-series-9', nome: 'Apple Watch Series 9', categoria: 'Smartwatch', modelo: 'Apple Watch Series 9',
    armazenamento: '45 mm', cor: 'Meia-noite', condicao: 'Seminovo', preco: null,
    imagens: ['apple-watch-series-9'], selo: null, destaque: false, confirmar: [CONDICAO, 'ainda em estoque?', 'garantia'],
  },

  /* ---------- Acessórios ---------- */
  {
    id: 'carregador-usb-c-20w', nome: 'Carregador USB-C 20W', categoria: 'Acessórios', modelo: 'Carregador USB-C 20W',
    armazenamento: null, cor: null, condicao: 'Lacrado', preco: null,
    imagens: ['carregador-20w'], selo: null, destaque: false, confirmar: ['garantia'],
  },
  {
    id: 'power-bank', nome: 'Carregador portátil (power bank)', categoria: 'Acessórios', modelo: 'Power bank',
    armazenamento: null, cor: null, condicao: 'Lacrado', preco: null,
    imagens: ['power-bank'], selo: null, destaque: false, confirmar: ['modelo e capacidade', 'garantia'],
  },

  /* ---------- Outros ---------- */
  {
    id: 'jbl-boombox-4', nome: 'JBL Boombox 4', categoria: 'Outros', modelo: 'JBL Boombox 4',
    armazenamento: null, cor: null, condicao: 'Lacrado', preco: null,
    imagens: ['jbl-boombox-4'], selo: null, destaque: false, confirmar: ['ainda em estoque?', 'garantia'],
  },

  /* Fones: nenhuma foto limpa em assets/. A categoria fica vazia até a loja enviar fotos. */
];

export function produtoPorId(id: string): Produto | undefined {
  return PRODUTOS.find((p) => p.id === id);
}

/** Produtos da seção "Mais vendidos", na ordem oficial. */
export function maisVendidos(): Produto[] {
  return store.maisVendidos.map((id) => produtoPorId(id)).filter((p): p is Produto => Boolean(p));
}
