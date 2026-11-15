# Vellari Phone · site

Site da Vellari Phone, loja de iPhone em Santa Fé do Sul - SP. O hero mostra o iPhone 18 Pro Max
em 3D e todos os botões de compra abrem o WhatsApp da loja. Não há checkout.

## Rodar

Precisa do [Node.js](https://nodejs.org) 22 ou mais novo.

```bash
npm install
```

```bash
npm run dev
```

O site abre em `http://localhost:5173`. Para gerar a versão de produção:

```bash
npm run build
```

O resultado fica na pasta `dist/`, pronta para publicar.

## Editar os dados da loja

Tudo fica em **`src/data/store.ts`**: WhatsApp, endereço, horário, garantia, formas de pagamento,
cidades de entrega, Instagram, CNPJ e as mensagens prontas do WhatsApp.

- Campos com `null` ainda não foram confirmados. O site esconde o que está `null`.
- Para preencher, troque `null` pelo valor entre aspas. Exemplo: `numero: '655'`.
- Depois de mudar o **domínio** (`dominio: 'https://vellariphone.com.br'`), rode `npm run build`
  de novo: o endereço entra nas tags de compartilhamento, no `sitemap.xml` e no `robots.txt`.
- Rastreamento: preencha `ga4Id` e `metaPixelId`. Eles só carregam depois que o visitante aceita
  o aviso de cookies. Sem ID, o aviso nem aparece.

## Editar produtos e preços

O catálogo fica em **`src/data/products.ts`**. Cada produto é um bloco:

```ts
{
  id: 'iphone-14', nome: 'iPhone 14', categoria: 'iPhone', modelo: 'iPhone 14',
  armazenamento: '128 GB', cor: 'Meia-noite', condicao: 'Seminovo', preco: null,
  imagens: ['iphone-14', 'iphone-14-roxo'], selo: 'Mais vendido', destaque: true,
},
```

- **Preço:** troque `preco: null` por um número, sem ponto de milhar: `preco: 3499`. Com `null`
  o card mostra "Consulte".
- **Novo produto:** copie um bloco, mude o `id` (único, sem espaço) e os demais campos.
- **Tirar um produto:** apague o bloco.
- **Condição:** `'Lacrado'` ou `'Seminovo'`. A garantia dos iPhones sai sozinha (1 ano e 3 meses).
- **Selo:** `'Mais vendido'`, `'Lançamento'`, `'Últimas unidades'` ou `null`.
- **Mais vendidos:** a ordem da seção está em `maisVendidos`, dentro de `store.ts`.

Regras que o site segue: nunca "sem juros" (o parcelamento é sempre "em até 18x (com juros)") e
nada de preço ou especificação inventados. O `npm run build` falha se achar "sem juros".

## Trocar ou adicionar fotos

As fotos originais ficam em `assets/` e **nunca são alteradas**. O site usa cópias recortadas e
otimizadas, geradas a partir de **`src/data/image-sources.json`**:

```json
"iphone-14": {
  "src": "assets/media/stories/202604/17944199076080341.jpg",
  "recorte": [0, 0.4, 1, 0.5627],
  "alt": "Dois iPhone 14 na cor meia-noite"
}
```

1. Coloque a foto nova em `assets/` (qualquer subpasta).
2. Acrescente uma entrada no JSON com um nome novo, o caminho em `src` e o texto em `alt`.
3. `recorte` é `[esquerda, topo, largura, altura]`, de 0 a 1. Para usar a foto inteira: `null`.
4. Rode:

```bash
npm run images
```

5. Use o nome novo no campo `imagens` do produto, em `products.ts`.

Para conferir os recortes antes de publicar:

```bash
npm run images -- --preview recortes.jpg
```

Outras imagens geradas:

- `npm run poster`: posters do hero, um por cor, feitos a partir do modelo 3D.
- `npm run marca`: favicon, ícones e a imagem de prévia do link (`og-vellari.jpg`).

Os dois precisam do Chrome ou do Edge instalado (o `marca` usa o poster já gerado).

## Editar textos

- Hero (título, cores, hotspots, linha de confiança): objeto `hero`, em `src/data/store.ts`.
- Benefícios, loja, entrega, Instagram, FAQ, CTA final e rodapé: `src/sections/pagina/template.ts`.
- Mais vendidos e vitrine: `src/sections/produtos/template.ts`.
- Título e descrição do Google: `src/render/seo.ts`.

A pergunta "Aceitam iPhone usado na troca?" ficou fora do FAQ até a loja confirmar. Para incluir,
acrescente um item na lista `FAQ` de `src/sections/pagina/template.ts`.

## Testar

```bash
npm run qa
```

Gera o build, abre o Chrome e confere os links de WhatsApp, os filtros, o modal, a rolagem no
toque e os textos. Os screenshots em 375, 768 e 1440 px ficam em `docs/fase-7/`.

```bash
npm run lighthouse
```

Mede Performance, Acessibilidade, Boas práticas e SEO no celular. O relatório fica em
`docs/fase-7/lighthouse.html`.

## Publicar

O site é 100% estático: basta enviar o conteúdo de `dist/` para a hospedagem.

**Hospedagem comum (cPanel, Hostinger, Locaweb e parecidas)**

1. Rode `npm run build`.
2. Envie tudo o que está dentro de `dist/` para a pasta pública do domínio (`public_html`).
3. Ative o HTTPS do domínio.

**Netlify**

- Arraste a pasta `dist/` para <https://app.netlify.com/drop>, ou conecte o repositório com:
  comando de build `npm run build` e pasta de publicação `dist`.

**Vercel**

- Importe o repositório. Framework: Vite. Comando `npm run build`, saída `dist`.

Nas duas últimas, as fotos originais de `assets/` não precisam subir: as versões otimizadas já
estão em `public/img/`.

Depois de publicar, preencha o domínio em `store.ts`, gere o build de novo e publique outra vez,
para a prévia do link no WhatsApp funcionar.

## Estrutura

```
src/
  data/       store.ts · products.ts · image-sources.json   ← o que você edita
  sections/   header · hero · produtos · pagina (demais seções)
  three/      modelo 3D do iPhone 18 Pro Max
  render/     HTML gerado no build (SEO, ícones, imagens)
  lib/        WhatsApp, horário e rastreamento
  styles/     cores, fontes e espaçamentos (tokens.css)
scripts/      imagens, posters, marca, QA e Lighthouse
public/       imagens otimizadas, favicon e manifest
assets/       fotos originais da loja (não mexer)
docs/         inventário de fotos, screenshots e relatórios
```
