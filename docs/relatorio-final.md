# Vellari Phone · relatório final

Site construído nas 7 fases do briefing. Este relatório lista o que ficou pendente e o que
precisa de uma decisão sua antes de publicar.

## 1. Resultado dos testes

**Lighthouse mobile (`npm run lighthouse`), medido nesta máquina:**

| Métrica | Resultado | Meta | |
|---|---|---|---|
| Performance | 69 | ≥ 85 | ✗ |
| Acessibilidade | 100 | ≥ 95 | ✓ |
| Boas práticas | 100 | ≥ 95 | ✓ |
| SEO | 100 | 100 | ✓ |
| LCP | 2,14 s | < 2,5 s | ✓ |
| CLS | 0 | < 0,1 | ✓ |
| Tempo de bloqueio (TBT) | 4,4 s | (compõe a Performance) | ✗ |

Como ler a Performance:

- O que segura a nota é a partida do 3D. Na placa de vídeo desta máquina (Intel HD 3000, de
  2011) ela trava a página por ~1,5 s logo depois de carregar; o Lighthouse multiplica isso pela
  lentidão simulada do celular e chega a 4,4 s de bloqueio.
- A maior parte é a geração da iluminação de estúdio (uma única chamada interna do Three.js, que
  não pode ser dividida) e a compilação dos shaders. Já reduzi sem mudar o visual: com a mesma
  calibração, o bloqueio caiu de 7,1 s para 4,4 s; medindo direto no navegador, a iluminação
  passou de ~1,1 s para ~0,6 s e os shaders de ~1 s para ~0,4 s.
- Esta máquina oscila muito (índice de benchmark entre 129 e 960 de uma medição para outra),
  então os números variam de uma rodada para outra. O script calibra a lentidão simulada pelo
  índice medido, como recomenda a calculadora oficial do Lighthouse.
- **PageSpeed Insights** (pagespeed.web.dev), depois de publicar, dá o número oficial. Atenção:
  os servidores do Google rodam sem placa de vídeo. Nesse caso o site fica no poster de propósito,
  então a nota de lá tende a sair alta sem medir o 3D. A medição local acima, com o 3D ligado,
  é a mais conservadora.

O que mudou para chegar aqui:

- O 3D só liga com placa de vídeo de verdade. Sem ela (render por software) o site fica no
  poster, porque o 3D travaria a página.
- O modelo usa 2 programas de shader em vez de 6, e os shaders da iluminação são compilados em
  segundo plano.
- Em aparelho lento, o 3D baixa a resolução sozinho e, se ainda assim estiver pesado, para de
  girar sozinho e só redesenha quando o visitante interage.
- As seções abaixo da dobra só são desenhadas quando chegam perto da tela.

**Testes automáticos:** 46 de 46 verificações da página inteira (`npm run qa`) e 18 de 18 do
hero (`npm run screenshots`) passaram, sobre o build de produção.

Conferido nos testes:

- 70 links de WhatsApp, todos com `wa.me/5517997220015` e a mensagem certa para a origem
  (hero com a cor, produto, entrega com a cidade, geral).
- Nenhum "sem juros" na página; o parcelamento aparece sempre como "em até 18x (com juros)".
- Filtros por categoria e condição, busca, ordenação e contagem da vitrine.
- Modal com galeria, formas de pagamento e o mesmo CTA; Esc fecha e devolve o foco.
- Rolagem no toque: arrasto vertical sobre o aparelho rola a página tanto quanto fora dele;
  arrasto horizontal gira sem rolar.
- Nota "Respondemos a partir das 08:00" no domingo e fora do horário, no fuso de São Paulo.
- Sem rolagem horizontal em 375, 768 e 1440 px; um único h1; alt em todas as imagens;
  áreas de toque de pelo menos 44 px; nenhum erro no console.

Screenshots em `docs/fase-7/`: `pagina-375.jpg`, `pagina-768.jpg`, `pagina-1440.jpg` e as telas
por seção.

**Não verificado:** iPhone real (Safari iOS), Chrome Android real, Firefox e Safari no desktop,
e a taxa de quadros do 3D em celular intermediário. Os testes rodaram no Chrome do Windows com
emulação de toque. Vale abrir o site no seu celular antes de publicar.

## 2. Placeholders pendentes

Estão como `null` em `src/data/store.ts`. O site esconde o campo; nada aparece com colchetes.

| Pendência | Onde aparece | Efeito hoje |
|---|---|---|
| Número do prédio e complemento | endereço, mapa, dados para o Google | Mostra "Rua 19, Centro" |
| Domínio | link canônico, prévia no WhatsApp, sitemap | **Sem prévia de imagem ao compartilhar o link** |
| Link da Fluxon Ai Agency | crédito no rodapé | Crédito sem link |
| Prazo, taxa e funcionamento da entrega | seção Entrega e FAQ | "Combine pelo WhatsApp" |
| ID do GA4 e do Meta Pixel | rastreamento | Nada é carregado; sem aviso de cookies |
| Outras cidades atendidas | seção Entrega | Só as 8 do briefing |
| "Aceitam iPhone usado na troca?" | FAQ | Pergunta fora do FAQ |

O protótipo e o design system citam "nº 655, 2º andar". Não usei porque o briefing deixou o
número em aberto.

## 3. Produtos para confirmar

O catálogo tem 26 produtos, montados a partir das fotos de `assets/`. Todos estão com preço
"Consulte". Armazenamento e cor vêm do texto do próprio story da loja.

**Mais vendidos**

| Produto | Condição no site | Confirmar |
|---|---|---|
| iPhone 18 Pro Max | Lacrado | foto; armazenamentos e cores em estoque |
| iPhone 18 Pro | Lacrado | foto; armazenamentos e cores em estoque |
| iPhone 17 Pro Max 256 GB | Lacrado | cores em estoque |
| iPhone 15 Pro Max | Seminovo | foto; condição; armazenamentos e cores |
| iPhone 14 Pro Max 256 GB Prateado | Seminovo | estoque |
| iPhone 14 Pro | Seminovo | foto; condição; armazenamentos e cores |
| iPhone 14 128 GB Meia-noite | Seminovo | estoque |
| iPhone 13 Pro 128 GB Prateado | Seminovo | estoque |
| iPhone 13 128 GB Azul | Seminovo | estoque |

**Demais produtos:** confirmar se ainda estão em estoque.

- iPhones seminovos: 15 Pro 128 GB, 14 Plus 128 GB, 13 Pro Max 256 GB, 12 128 GB,
  11 Pro Max 256 GB e 11.
- Android lacrados: Redmi Note 17, Redmi Note 14 Pro 5G, Redmi Note 14, Redmi 14C, Poco X7 Pro,
  Realme C73 e Realme C63.
- Apple Watch Series 9 45 mm (marcado como Seminovo; confirmar a condição).
- Carregador USB-C 20W, carregador portátil (confirmar modelo e capacidade) e JBL Boombox 4.

**Garantia fora dos iPhones:** o briefing só define a garantia dos iPhones. Android, relógio e
acessórios mostram apenas "Lacrado" ou "Seminovo", sem prazo, até a loja informar.

## 4. Imagens faltando

- **iPhone 18 Pro Max, iPhone 18 Pro, iPhone 15 Pro Max e iPhone 14 Pro:** nenhuma foto real em
  `assets/`. Os cards mostram o bloco neutro "Foto em breve".
- **Fones:** nenhuma foto limpa. A categoria não aparece nos filtros.
- **Loja (fachada, entrada, balcão):** nenhuma foto. A seção "Por que a Vellari" mostra o bloco
  "Foto da loja em breve".
- **Depoimentos:** nenhum texto real de cliente. A seção Clientes mostra só fotos.
- **Wallpaper do aparelho 3D:** não havia; a tela usa um gradiente nas cores da marca.
- **Poster do hero:** sem foto do 18 Pro Max, os posters são renders do próprio modelo 3D.

As fotos de produto são recortes de stories. Fundo, luz e enquadramento variam de uma para
outra; fotos tiradas para o site deixariam a vitrine mais uniforme.

## 5. Fotos de clientes: confirmar autorização (LGPD)

O site usa 2 fotos, ambas da fase Vellari, recortadas para tirar o @ do cliente:

| No site | Arquivo original |
|---|---|
| `cliente-01` | `assets/media/stories/202604/18095873783119613.jpg` |
| `cliente-02` | `assets/media/stories/202609/17989385967103855.jpg` |

Se alguma não tiver autorização, apague a entrada em `src/data/image-sources.json` e o nome na
lista de `clientesSection`, em `src/sections/pagina/template.ts`.

As outras 59 fotos de clientes de `assets/` não foram usadas: mostram a marca antiga
"Rafa Imports". A lista completa está em `docs/fase-0/inventario-imagens.csv` (tipo `cliente`).

## 6. Decisões que dependem de você

1. **Fotos reais mostram a maçã dos aparelhos.** Li a regra "sem logo da Apple" como válida para
   o modelo 3D, os gráficos e a imagem de prévia, que não têm o logo. As fotos de produto são
   fotos reais dos aparelhos. Se a regra valer também para elas, quase todas saem.
2. **Card do iPhone 18 Pro Max na vitrine.** Hoje é "Foto em breve", como manda o briefing. Posso
   usar o render 3D ali também, se você preferir.
3. **"Até 18x no cartão".** A linha de confiança do hero e a faixa de benefícios usam o texto
   curto do briefing. O "(com juros)" aparece nos cards, no modal, no FAQ e na descrição da
   faixa. Posso acrescentar a ressalva nos dois textos curtos.
4. **Carrinho, seção Troca e "100% originais"** do protótipo ficaram de fora, porque não estão
   nos dados oficiais. Voltam se a loja confirmar.
5. **Sacola Vellari.** Ela tem a silhueta de uma maçã; evitei fotos em que aparece.
6. **Git.** Não está instalado nesta máquina, então não há commits por fase. Depois de instalar,
   o `.gitignore` já deixa `assets/media/` (1 GB) fora do repositório.

## 7. Antes de publicar

1. Abrir no celular e testar: girar o aparelho, rolar por cima dele, trocar a cor e tocar em
   "Quero o iPhone 18 Pro Max".
2. Preencher o domínio em `store.ts` e gerar o build de novo.
3. Confirmar os itens das seções 2, 3 e 5.
