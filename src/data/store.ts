/* =====================================================================
   DADOS OFICIAIS DA VELLARI PHONE
   Edite aqui: o layout se ajusta sozinho.

   - Campos com valor null ainda não foram confirmados pela loja. O site
     esconde o que está null (nunca mostra colchetes para o cliente).
   - Nunca invente: preço, número, prazo ou especificação só entram
     quando a loja confirmar.
   ===================================================================== */

export const store = {
  nome: 'Vellari Phone',
  descricao: 'Loja de iPhones, smartphones e eletrônicos em Santa Fé do Sul - SP.',

  /** Domínio sem barra no final. null = ainda não definido. */
  dominio: 'https://vellariphone.com' as string | null,

  whatsapp: {
    /** Só números: 55 + DDD + número. Usado em https://wa.me/<numero> */
    numero: '5517997220015',
    exibicao: '(17) 99722-0015',
    internacional: '+55 17 99722-0015',
  },

  email: 'vellariphone@gmail.com',
  cnpj: '41.253.575/0001-01',

  instagram: {
    usuario: '@vellari_phone',
    url: 'https://www.instagram.com/vellari_phone/',
  },

  endereco: {
    rua: 'Rua 19',
    numero: null as string | null, // [CONFIRMAR: número do prédio]
    complemento: null as string | null, // [CONFIRMAR: ex.: "2º andar"]
    bairro: 'Centro',
    cidade: 'Santa Fé do Sul',
    uf: 'SP',
    cep: '15775-057',
    pais: 'BR',
  },

  horario: {
    texto: 'Segunda a sábado, das 08:00 às 18:00. Domingo: fechado.',
    /** 0 = domingo ... 6 = sábado */
    diasAbertos: [1, 2, 3, 4, 5, 6],
    abre: '08:00',
    fecha: '18:00',
    fuso: 'America/Sao_Paulo',
    notaForaDoHorario: 'Respondemos a partir das 08:00',
  },

  garantia: {
    Lacrado: '1 ano de garantia',
    Seminovo: '3 meses de garantia',
  },

  pagamento: {
    formas: ['Pix', 'Cartão de débito', 'Dinheiro', 'Cartão de crédito'],
    parcelasMax: 18,
    /** Texto oficial do parcelamento. Nunca escreva "sem juros". */
    parcelamento: 'em até 18x (com juros)',
    resumo: 'Pix, cartão de débito, dinheiro e cartão de crédito em até 18x (com juros).',
  },

  entrega: {
    titulo: 'Atendemos Santa Fé do Sul e região',
    cidades: [
      'Santa Fé do Sul',
      'Rubinéia',
      "Santa Clara d'Oeste",
      'Três Fronteiras',
      'Ilha Solteira',
      'Aparecida do Taboado (MS)',
      'Jales',
      'Fernandópolis',
    ],
    prazo: null as string | null, // [CONFIRMAR]
    taxa: null as string | null, // [CONFIRMAR]
    comoFunciona: null as string | null, // [CONFIRMAR]
  },

  /** Ordem oficial da seção "Mais vendidos" (ids de products.ts). */
  maisVendidos: [
    'iphone-18-pro-max',
    'iphone-18-pro',
    'iphone-17-pro-max',
    'iphone-15-pro-max',
    'iphone-14-pro-max',
    'iphone-14-pro',
    'iphone-14',
    'iphone-13-pro',
    'iphone-13',
  ],

  agencia: {
    nome: 'Fluxon Ai Agency',
    url: null as string | null, // [CONFIRMAR: link da agência]
  },

  avisoMarca: 'iPhone é marca registrada da Apple Inc. A Vellari Phone não tem vínculo com a Apple.',

  /** Rastreamento opcional. Só carrega com o ID preenchido e o aceite de cookies. */
  rastreamento: {
    ga4Id: null as string | null, // [GA4_ID] ex.: "G-XXXXXXXXXX"
    metaPixelId: null as string | null, // [PIXEL_ID]
  },

  /** Mensagens prontas do WhatsApp, por origem do clique. {chaves} são trocadas na hora. */
  mensagens: {
    hero: 'Olá! Vi o iPhone 18 Pro Max {cor} no site da Vellari e quero saber valores e condições.',
    produto: 'Olá! Tenho interesse no {nome} {armazenamento} {cor} ({condição}) que vi no site.',
    entrega: 'Olá! Sou de {cidade} e quero saber como funciona a entrega.',
    geral: 'Olá! Vim pelo site da Vellari Phone e quero tirar uma dúvida.',
  },
} as const;

/* =====================================================================
   HERO: iPhone 18 Pro Max (lançamento Apple de 09/09/2026)
   Use só estes dados nos textos. Não acrescente especificações.
   ===================================================================== */
export const hero = {
  produto: 'iPhone 18 Pro Max',
  tela: '6,9"',
  chip: 'A20 Pro (2 nm)',
  camera: 'Câmera principal Fusion de 48 MP com abertura variável (ƒ/1.48 a ƒ/4)',
  armazenamentos: ['256 GB', '512 GB', '1 TB', '2 TB'],
  /** Milímetros: altura x largura x espessura. */
  dimensoes: { altura: 163.4, largura: 78, espessura: 8.75 },

  /** Cores do modelo 3D. Sem foto oficial em assets/, valem as aproximações do briefing. */
  cores: [
    { id: 'bordo', nome: 'Bordô', hex: '#5C1A26', destaque: true },
    { id: 'preto', nome: 'Preto', hex: '#232326', destaque: false },
    { id: 'prata', nome: 'Prata', hex: '#DCDCDC', destaque: false },
    { id: 'glacial', nome: 'Glacial', hex: '#C9D8E2', destaque: false },
  ],
  corInicial: 'bordo',

  confianca: ['Lacrado com 1 ano de garantia', 'Até 18x no cartão', 'Pix, débito e dinheiro'],

  /** Pontos clicáveis no aparelho. Bateria ficou de fora: não há dado oficial. [CONFIRMAR] */
  hotspots: [
    {
      id: 'camera',
      rotulo: 'Câmera de 48 MP',
      titulo: 'Câmera Fusion de 48 MP',
      texto: 'Câmera principal Fusion de 48 MP com abertura variável, de ƒ/1.48 a ƒ/4.',
    },
    {
      id: 'chip',
      rotulo: 'Chip A20 Pro',
      titulo: 'Chip A20 Pro',
      texto: 'Chip A20 Pro, fabricado em 2 nm, dentro de um corpo unibody de alumínio.',
    },
    {
      id: 'tela',
      rotulo: 'Tela de 6,9"',
      titulo: 'Tela de 6,9"',
      texto: 'Tela de 6,9 polegadas, com Dynamic Island menor.',
    },
  ],
} as const;

export type CorHero = (typeof hero.cores)[number];
export type HotspotHero = (typeof hero.hotspots)[number];

/** Endereço em uma linha, só com o que já foi confirmado. */
export function enderecoCompleto(): string {
  const e = store.endereco;
  const rua = e.numero ? `${e.rua}, nº ${e.numero}` : e.rua;
  const partes = [rua, e.complemento, e.bairro].filter(Boolean).join(', ');
  return `${partes}, ${e.cidade} - ${e.uf}, CEP ${e.cep}`;
}
