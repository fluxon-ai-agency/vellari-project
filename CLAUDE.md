# Vellari Phone · site

Site da Vellari Phone, loja de iPhones, smartphones e eletrônicos em Santa Fé do Sul - SP.
Dois objetivos, nesta ordem: impressionar com o iPhone 18 Pro Max em 3D no hero e converter
visitantes em conversas no WhatsApp. Não há checkout.

Antes de continuar o trabalho, leia `docs/CONTEXTO-DA-SESSAO.md` (onde o projeto parou e as
decisões tomadas) e `docs/relatorio-final.md` (pendências com o cliente).

O briefing completo está em `PROMPT.md.txt`. O protótipo aprovado (`index.html.txt`) define a
identidade visual: o site deve parecer uma evolução dele. Se o protótipo divergir dos dados
abaixo, valem os dados abaixo.

## Comandos

- `npm run dev`: servidor de desenvolvimento
- `npm run build`: checa tipos, gera `dist/` e roda a checagem de textos
- `npm run images`: recorta e otimiza as imagens de `src/data/image-sources.json`
- `npm run poster`: gera os posters do hero a partir do modelo 3D (precisa do Chrome)
- `npm run marca`: favicon, ícones, manifest e imagem de prévia (`og-vellari.jpg`)
- `npm run screenshots`: screenshots e testes de interação do hero (375 e 1440 px)
- `npm run qa`: build + testes da página inteira + screenshots em 375, 768 e 1440 px
- `npm run lighthouse`: build + Lighthouse mobile (`-- --janela` usa a placa de vídeo real)

Os testes rodam no Chrome sem placa de vídeo. Nesse caso o site fica no poster de propósito
(`failIfMajorPerformanceCaveat`); os scripts navegam com `?3d=1` para ligar o 3D mesmo assim.
Ao editar scripts pelo PowerShell, escreva um arquivo `.cjs`/`.mjs` em vez de `node -e "..."`:
as aspas se perdem.

## Dados oficiais da loja

Tudo fica em `src/data/store.ts`. Nunca escreva estes dados direto no layout.

- Nome: Vellari Phone
- Instagram: @vellari_phone (https://www.instagram.com/vellari_phone/)
- WhatsApp: (17) 99722-0015, link com 5517997220015
- E-mail: vellariphone@gmail.com
- CNPJ: 41.253.575/0001-01
- Endereço: Rua 19, nº [NÚMERO], Centro, Santa Fé do Sul - SP, CEP 15775-057
- Horário: segunda a sábado, 08:00 às 18:00. Domingo fechado.
- Garantia: iPhones lacrados 1 ano; iPhones seminovos 3 meses
- Pagamento: Pix, cartão de débito, dinheiro e cartão de crédito em até 18x (com juros)
- Entrega: Santa Fé do Sul, Rubinéia, Santa Clara d'Oeste, Três Fronteiras, Ilha Solteira,
  Aparecida do Taboado (MS), Jales e Fernandópolis. Prazo, taxa e funcionamento: [CONFIRMAR]
- Mais vendidos, nesta ordem: iPhone 18 Pro Max, 18 Pro, 17 Pro Max, 15 Pro Max, 14 Pro Max,
  14 Pro, 14, 13 Pro e 13
- Domínio: vellariphone.com (https://vellariphone.com), hospedagem na Hostinger
- Link da agência (Fluxon Ai Agency): [CONFIRMAR]

O que está entre colchetes ainda não foi confirmado. No código fica como `null`, o site esconde
o campo (nunca mostra colchete para o cliente) e o item entra no relatório de pendências.

## Regras inegociáveis

1. Só o iPhone 18 Pro Max é 3D, e só no hero. Todo o resto é imagem 2D vinda de `assets/`.
2. Nunca invente preço, avaliação, depoimento, número ou especificação. Sem dado, use `null`.
3. Parcelamento é sempre "em até 18x (com juros)". Nunca "sem juros".
4. Condição dos aparelhos: "Lacrado" e "Seminovo", sempre com a garantia (1 ano e 3 meses).
5. Sem logo da Apple (nem no modelo 3D) e sem dizer que a loja é revendedora autorizada.
   Rodapé: "iPhone é marca registrada da Apple Inc. A Vellari Phone não tem vínculo com a Apple."
6. Fotos de clientes: só as de `assets/`, e todas listadas no relatório para autorização (LGPD).
7. Mobile-first: tudo funciona primeiro em 375 px de largura.
8. Português do Brasil, tom premium e próximo, frases curtas e orientadas à ação.

Sobre o iPhone 18 Pro Max, use só os dados de `hero` em `store.ts` (tela de 6,9", chip A20 Pro
de 2 nm, câmera Fusion de 48 MP com abertura variável ƒ/1.48 a ƒ/4, Dynamic Island menor, corpo
unibody de alumínio, cores Preto, Prata, Glacial e Bordô, 256 GB a 2 TB).

## A pasta `assets/`

- É a exportação do Instagram da loja. Nunca altere, renomeie ou apague nada ali.
- Versões otimizadas vão para `public/img/`, geradas por `scripts/images.mjs`.
- Não use banco de imagens nem imagem gerada por IA. Sem foto, placeholder neutro.
  Exceção pedida pelo usuário em 15/11/2026: as fotos dos iPhones da vitrine vêm de
  `assets/media/fotos-dos-iphones-da-vitrine/` (geradas por IA e enviadas pela agência).
- Não use: fotos com "sem juros", pods, perfumes, a marca antiga "Rafa Imports" e preços antigos.
- O inventário foto a foto está em `docs/fase-0/inventario-imagens.csv`.

## Stack e estrutura

Vite + TypeScript + Three.js, sem framework de UI. Saída estática em `dist/`.

```
src/
  data/       store.ts (loja, hero, mensagens) · products.ts (catálogo) · image-sources.json
  render/     HTML gerado no build: seo.ts (head, JSON-LD), sprite.ts, html.ts (<picture>), slots.ts
  sections/   header · hero · produtos (mais vendidos, vitrine, modal) · pagina (benefícios,
              loja, clientes, entrega, Instagram, FAQ, CTA final, rodapé, flutuante, cookies).
              Cada pasta: template.ts (HTML) + index.ts (comportamento) + CSS
  three/      cena 3D do iPhone 18 Pro Max (carregada com import dinâmico)
  lib/        whatsapp.ts · horario.ts · rastreamento.ts
  styles/     tokens.css (design tokens do protótipo) · base.css
  generated/  images.json (manifesto gerado, não edite)
scripts/      images · hero-poster · marca · screenshots · qa · lighthouse · check-copy
public/img/   imagens otimizadas (geradas)
assets/       originais (não mexer)
```

- O HTML das seções é gerado no build pelo plugin em `vite.config.ts`, que troca os
  `<!-- slot:nome -->` do `index.html` pelo retorno dos `template.ts`. Os templates são funções
  puras: sem DOM e sem importar CSS.
- Imports relativos sempre com a extensão (`'./poster.ts'`, `'./header/index.ts'`) e JSON com
  `with { type: 'json' }`: o `vite.config.ts` carrega os templates direto pelo Node.
- CSS com variáveis de `tokens.css`. Azul é ação: fundo azul só em elemento clicável.
- Three.js nunca entra no bundle inicial: só via `import()` em `src/sections/hero/index.ts`.
- Performance do 3D (medida, não mexa sem medir de novo):
  - O modelo usa só 2 programas de shader: `MeshStandardMaterial` para metais e peças foscas, e
    `MeshPhysicalMaterial` com clearcoat + `map` + `emissiveMap` para tudo que tem verniz (os que
    não têm textura recebem `branco`, 1 pixel). Material novo deve cair num desses dois.
  - Os shaders da `RoomEnvironment` são compilados com `compileAsync` antes do `fromScene`.
  - Sem placa de vídeo, o 3D não liga (fica o poster). Em aparelho lento, a resolução cai e entra
    o modo econômico (sem auto-rotação).
  - Para medir cada etapa da partida: `npm run dev` e abrir com `?medir3d` (marcas
    `vellari-3d:*` no painel Performance do navegador e no Lighthouse em "User Timing").
  - Mudou material ou luz do 3D: rode `npm run poster` e `npm run marca` para o poster e a
    imagem de prévia continuarem iguais ao 3D.
- Links de WhatsApp sempre por `src/lib/whatsapp.ts`, com os templates de `store.mensagens`.

## Qualidade

- Lighthouse mobile: Performance ≥ 85, Acessibilidade ≥ 95, Boas práticas ≥ 95, SEO 100.
- LCP < 2,5 s em 4G e CLS < 0,1.
- Contraste AA, foco visível, navegação por teclado, áreas de toque de pelo menos 44 px.
- Hotspots e seletor de cores acessíveis por teclado e leitor de tela.
- O canvas 3D nunca prende a rolagem: arrasto horizontal gira, arrasto vertical rola a página.
- Respeite `prefers-reduced-motion`: sem 3D e sem animações de entrada.
- Funciona em Safari iOS, Chrome Android e Chrome, Edge, Safari e Firefox no desktop.
- Nenhum erro no console.

## Fluxo

Trabalho em fases (ver seção 10 do briefing), com pausa para aprovação depois das fases 0, 1 e 3.
Faça um commit ao final de cada fase, quando o git estiver disponível.
