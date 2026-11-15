# Vellari Phone · Design System

**Versão 1.0 · outubro de 2026**

Base visual do e-commerce da Vellari Phone (Santa Fé do Sul - SP). Vale para o site, para o checkout que fecha no WhatsApp e para os posts do Instagram.

**Material analisado:** logo oficial, posts "3 motivos", "Fazemos upgrade!" e "Comparativo iPhone 18", o site atual da Vellari e três referências de e-commerce de eletrônicos (Arsh Mobile, TechNest e TechNova).

---

## 0. Três princípios

Toda decisão deste sistema sai destas três regras.

1. **Azul é ação.** Todo azul preenchido é clicável e leva para a compra ou para o WhatsApp. Nenhum elemento decorativo ganha fundo azul de botão.
2. **Branco é produto.** O aparelho aparece sempre numa "caixa" branca, como a embalagem da Apple, mesmo na vitrine escura.
3. **Confiança perto do preço.** "100% original", "Garantia", "Até 18x" e "Aceitamos seu usado" ficam a no máximo um bloco de distância do preço e do botão de compra.

---

## 1. Cores

### 1.1 Paleta principal

| Cor | Hex | RGB | Onde usar |
|---|---|---|---|
| **Azul Vellari** | `#074DFF` | 7, 77, 255 | Botões de compra e de WhatsApp, Arco Vellari, links no fundo claro, opção selecionada |
| **Preto Vellari** | `#050505` | 5, 5, 5 | Logo, títulos e texto no fundo claro, botão escuro dos cards |
| **Branco** | `#FFFFFF` | 255, 255, 255 | Cards de produto, texto sobre fundo escuro, botão inverso |

> Origem: o azul é a mediana medida na letra "A" e na seta da logo. O preto vem das letras do logo, que variam de `#030303` a `#0F0F0F`.

### 1.2 Paleta secundária

| Cor | Hex | RGB | Onde usar |
|---|---|---|---|
| **Azul Royal** | `#0237C9` | 2, 55, 201 | Hover do botão primário, títulos de oferta, início do gradiente |
| **Azul Marinho** | `#0A206C` | 10, 32, 108 | Círculos de ícone e textos de destaque no fundo claro (como nos posts) |
| **Azul Brilho** | `#1E8CFF` | 30, 140, 255 | Ponta clara do gradiente da seta e brilhos. **Nunca para texto** |

### 1.3 Paleta de suporte

**Neutros escuros (vitrine)**

| Cor | Hex | Onde usar |
|---|---|---|
| Noite | `#070A12` | Fundo base da vitrine escura |
| Grafite | `#0F1420` | Superfície 1: painéis, campos de formulário, cards de benefício |
| Aço | `#1A2133` | Superfície 2: hover, chips, menus |
| Linha | `#263047` | Divisórias e bordas decorativas |
| Borda de campo (escuro) | `#5E6A88` | Borda de inputs no escuro (3,4:1 sobre Grafite) |
| Neblina | `#9AA5BF` | Texto secundário no escuro |

**Neutros claros (loja)**

| Cor | Hex | Onde usar |
|---|---|---|
| Gelo | `#F4F6FB` | Fundo base claro (o mesmo tom dos posts) |
| Névoa | `#E6EBF5` | Fundo da imagem do produto, preenchimentos sutis |
| Prata | `#C3CAD8` | Divisórias e bordas decorativas no claro |
| Borda de campo (claro) | `#848FA9` | Borda de inputs no claro (3,2:1 sobre Branco) |
| Ardósia | `#5B6889` | Texto secundário no claro |

**Azuis de apoio**

| Cor | Hex | Onde usar |
|---|---|---|
| Azul Claro | `#5B8CFF` | Texto, links e ícones azuis sobre o escuro. O Azul Vellari não tem contraste para texto pequeno no preto |
| Azul Gelo | `#E7EEFF` | Fundo de opção selecionada e de selos no claro |

### 1.4 Cores funcionais

| Função | No claro (texto / fundo) | No escuro (texto) | Uso |
|---|---|---|---|
| Sucesso | `#067647` / `#DCFAE6` | `#47CD89` | Campo válido, "Pedido montado" |
| Alerta | `#B54708` / `#FEF0C7` | `#FDB022` | "Últimas unidades", só quando for verdade |
| Erro | `#B42318` / `#FEE4E2` | `#FF8A80` | Campo inválido, produto esgotado |
| Online | `#25D366` | `#25D366` | Só o ponto de status "Online agora", sempre com o texto ao lado |

> **Por que o verde do WhatsApp não vira botão:** texto branco sobre `#25D366` tem contraste de 1,98:1 e reprova. Os próprios posts da Vellari usam botão azul com o ícone do WhatsApp, e é esse padrão que o site segue.

### 1.5 Gradientes

| Nome | Valor | Onde usar |
|---|---|---|
| Gradiente Seta | `linear-gradient(90deg, #0237C9 0%, #074DFF 55%, #1E8CFF 100%)` | Arco Vellari e banners de oferta |
| Gradiente Oferta | `linear-gradient(180deg, #0A206C 0%, #074DFF 100%)` | Texto dos títulos promocionais no fundo claro ("UPGRADE!") |
| Halo de produto | `radial-gradient(closest-side, rgba(7,77,255,.45), transparent)` | Atrás do aparelho na vitrine escura |

Gradiente aparece só na seta, nos banners e no halo. **Botões são sempre de cor sólida.**

### 1.6 Proporção de uso (60 · 30 · 10)

| Superfície | 60% | 30% | 10% |
|---|---|---|---|
| Vitrine escura (home, lançamentos, hero) | Noite e Grafite | Branco (cards e texto) | Azul Vellari |
| Loja clara (catálogo, produto, checkout) | Branco e Gelo | Preto e Marinho (texto) | Azul Vellari |

Se o azul passar de 10% da tela, o botão de compra perde o destaque.

### 1.7 Contraste (WCAG 2.1)

| Combinação | Contraste | Resultado |
|---|---|---|
| Branco sobre Azul Vellari | 5,98:1 | AA para qualquer texto |
| Branco sobre Azul Royal | 8,78:1 | AAA |
| Azul Vellari sobre Branco | 5,98:1 | AA |
| Azul Vellari sobre Gelo | 5,53:1 | AA |
| Azul Vellari sobre Noite | 3,31:1 | Só formas e texto a partir de 24px. Para texto, use Azul Claro |
| Azul Claro sobre Noite | 6,26:1 | AA |
| Ardósia sobre Branco | 5,55:1 | AA |
| Neblina sobre Noite | 8,02:1 | AAA |
| Preto Vellari sobre Gelo | 18,85:1 | AAA |
| Branco sobre Azul Brilho | 3,36:1 | Evitar |
| Branco sobre Verde WhatsApp | 1,98:1 | Reprovado |

---

## 2. Tipografia

### 2.1 Famílias

**Principal: Archivo** (Google Fonts, variável: largura 62–125%, peso 100–900, com itálico). Uma família só para títulos, ofertas, interface e texto: carrega um arquivo e mantém tudo coerente.

| Corte | Configuração | Papel |
|---|---|---|
| Archivo Expandida | largura 125%, peso 800–900 | Títulos. Ecoa as letras largas do logo |
| Archivo Condensada Itálica | largura 75%, peso 900, itálico | Ofertas e chamadas ("FAZEMOS UPGRADE!") |
| Archivo Normal | largura 100%, peso 400–700 | Texto, botões, formulários e preços |

**Destaque manuscrito: Yellowtail.** Para frases curtas de assinatura, como "A hora é agora!". No máximo uma por tela, até 5 palavras, nunca em botão ou preço.

**Alternativas para posts no Canva:** Archivo Black (títulos), Archivo Narrow (ofertas) e Montserrat (texto), caso a Archivo variável não esteja disponível.

**Fontes parecidas com o logo** (só referência, o logo é sempre o arquivo oficial): Michroma, Syncopate Bold, Krona One.

### 2.2 Hierarquia

Base de 16px, razão de cerca de 1,25, arredondada para a grade de 4px.

| Estilo | Desktop | Mobile | Peso | Largura | Altura de linha | Espaçamento | Uso |
|---|---|---|---|---|---|---|---|
| Display | 72px | 44px | 900 | 125% | 0,95 | -0,035em | Hero da home, 1 por página |
| H1 | 56px | 36px | 850 | 125% | 1,0 | -0,03em | Título da página |
| H2 | 40px | 30px | 800 | 115% | 1,05 | -0,025em | Título de seção |
| H3 | 28px | 22px | 750 | 110% | 1,15 | -0,015em | Subtítulo, título de painel |
| H4 | 20px | 18px | 700 | 100% | 1,25 | -0,005em | Nome do produto, título de card |
| Oferta | 64px | 40px | 900 itálico | 75% | 0,9 | -0,01em, maiúsculas | Banners e posts promocionais |
| Selo PHONE | 12px | 11px | 700 | 125% | 1,3 | 0,38em, maiúsculas | Categoria da seção, com as linhas do logo |
| Lead | 19px | 17px | 400 | 100% | 1,6 | 0 | Primeiro parágrafo |
| Corpo | 16px | 16px | 400 | 100% | 1,6 | 0 | Texto corrido |
| Corpo P | 14px | 14px | 500 | 100% | 1,5 | 0 | Descrição de card, ajuda de campo |
| Legenda | 12px | 12px | 500 | 100% | 1,45 | 0,01em | Notas legais, rodapé |
| Preço | 28px | 24px | 800 | 100% | 1,1 | -0,01em, números tabulares | Preço do produto |
| Parcela | 15px | 14px | 600 | 100% | 1,4 | 0 | "ou 18x de R$ 499,94 no cartão" |
| Botão | 16px | 15px | 700 | 110% | 1,0 | 0 | Rótulo de botão |
| Assinatura | 32px | 26px | 400 (Yellowtail) | — | 1,1 | 0 | Frase manuscrita |

### 2.3 Regras de uso

- Títulos com no máximo 2 linhas no desktop e 3 no mobile, com `text-wrap: balance`.
- Texto corrido com até 65 caracteres por linha.
- No site, botões e títulos em frase normal ("Chama no WhatsApp"). Maiúsculas só no estilo Oferta, no Selo PHONE e nos selos de card.
- Preço sempre em Archivo Normal com números tabulares, nunca na largura condensada ou expandida.
- Nunca escreva "VELLARI" com uma fonte. Use o arquivo do logo.

---

## 3. Componentes

### 3.1 Botões

**Base:** raio pílula, Archivo 700 com largura 110%, ícone de 20px com 10px de espaço, área de toque mínima de 44px.

| Tamanho | Altura | Padding lateral | Fonte |
|---|---|---|---|
| P | 40px | 16px | 14px |
| M (padrão) | 48px | 22px | 15px |
| G | 56px | 28px | 16px |

| Variante | Visual | Quando usar |
|---|---|---|
| Primário | Azul Vellari sólido, texto branco | Ação principal: "Comprar agora", "Finalizar pedido". Um por bloco |
| WhatsApp | Primário com o ícone do WhatsApp à esquerda | Toda ação que abre o WhatsApp. O texto sempre diz "WhatsApp" |
| Escuro / Inverso | Preto sólido no claro, Branco sólido no escuro | "Ver opções" nos cards e ações secundárias fortes |
| Contorno | Borda de 1,5px, fundo transparente | "Ver loja completa", "Quanto vale meu usado?" |
| Texto | Link azul com sublinhado no hover | Ações de baixa prioridade: "Ver detalhes", "Remover" |
| Ícone | Círculo de 44px | Carrinho, menu, "+" para adicionar |

**Estados do Primário**

| Estado | Visual |
|---|---|
| Padrão | Fundo `#074DFF` |
| Hover | Fundo `#0237C9`, brilho azul no escuro ou Sombra 2 no claro |
| Pressionado | Fundo `#022EA8`, desce 1px |
| Foco (teclado) | Anel de 3px em Azul Claro `#5B8CFF`, afastado 3px |
| Desativado | Claro: fundo Prata e texto Ardósia. Escuro: fundo Aço e texto `#7A859E`. Sem sombra |
| Carregando | Spinner de 18px no lugar do ícone, texto "Abrindo WhatsApp…", mesma largura |

**Regras:** nunca dois primários lado a lado (o par certo é Primário + Contorno). O texto diz o que acontece ao tocar. No mobile, o botão de compra aparece sem rolar.

### 3.2 Inputs de formulário

| Item | Especificação |
|---|---|
| Altura | 48px (busca: 52px) |
| Raio | 12px (busca: pílula) |
| Texto | 16px, para o iPhone não dar zoom ao tocar |
| Rótulo | Acima do campo, 14px peso 600 |
| Ajuda | Abaixo do campo, 13px em Ardósia (claro) ou Neblina (escuro) |
| Fundo e borda | Claro: Branco com borda `#848FA9`. Escuro: Grafite com borda `#5E6A88` |
| Foco | Borda Azul Vellari + anel de 4px `rgba(7,77,255,.25)` |
| Erro | Borda de Erro + ícone + mensagem que diz como corrigir: "Digite o DDD e o número. Ex.: (17) 99722-0015" |
| Sucesso | Borda de Sucesso + ✓, só em campos validados (como o WhatsApp) |
| Desativado | Fundo Névoa (claro) ou Aço (escuro), texto Ardósia |

**Controles de escolha**

- **Opção (armazenamento):** chip de 44px, raio 12px, borda de 1,5px na cor de borda de campo. Selecionado: borda Azul Vellari; no claro, fundo Azul Gelo e texto Azul Royal; no escuro, fundo `#102766` e texto Branco.
- **Cor do aparelho:** amostra redonda de 32px. Selecionada com anel azul de 2px afastado 2px. O nome da cor aparece escrito ao lado.
- **Checkbox:** 20px, raio 6px, marcado em Azul Vellari.
- **Busca:** pílula com ícone de lupa e exemplos reais no placeholder: "Buscar iPhone 17 Pro, Air, JBL…".

**Regras de conversão:** peça só nome, cidade e forma de entrega. Nunca exija cadastro ou e-mail. Use máscara no campo de WhatsApp. O placeholder é exemplo, nunca substitui o rótulo.

### 3.3 Cards

**Card de produto**

- Fundo sempre Branco, mesmo na vitrine escura.
- Raio 22px e padding 10px. A área da imagem tem raio 12px (22 − 10), fundo radial de Branco para Névoa e proporção 1:1.
- Selo no canto superior esquerdo da imagem. No máximo um selo por card.
- Ordem: nome (H4), armazenamentos (Corpo P), bolinhas de cor de 14px, preço, parcela e ações.
- Ações: botão Escuro "Ver opções" + botão de ícone "+" para adicionar ao carrinho.
- Hover no desktop: sobe 3px e ganha Sombra 2. No toque, sem hover.
- Sem preço: "Preço do dia no WhatsApp" no lugar do valor, mantendo "em até 18x no cartão".
- Esgotado: imagem esmaecida, sem botão de compra, com o botão Contorno "Avise-me no WhatsApp".

**Card de benefício (confiança)**

- Fundo Branco no claro, ou Grafite com borda Linha no escuro. Raio 18px, padding 20–24px.
- Ícone em círculo de 44px: Azul Marinho no claro, Azul Vellari no escuro (como nos posts).
- Título 16px peso 700 e texto em Corpo P.

**Card de especificação (comparativo)**

- Ícone em quadrado de 36px com raio 10px, fundo Azul Gelo e ícone Azul Vellari.
- Valor em 15px peso 700 e rótulo em 12px Ardósia.
- Exemplo do post: 6,9" 120 Hz · Apple A20 Pro · 12 GB RAM · 48 Mpx · 5567 mAh.

**Card de depoimento**

- Foto real do cliente com a caixa na mão (proporção 4:5, raio 18px), nome, modelo comprado e uma frase curta.

**Banner de oferta**

- Raio 30px, fundo no Gradiente Seta (ou Noite com halo), título no estilo Oferta, Assinatura opcional e botão Inverso (branco). Um por página.

### 3.4 Selos (badges)

Pílula, 11px peso 700, maiúsculas com 0,08em, padding 6px × 10px.

| Selo | Fundo / Texto | Quando |
|---|---|---|
| Lançamento | Azul Vellari / Branco | Linha atual da Apple |
| Novo | Preto / Branco | Aparelho lacrado |
| Seminovo | Contorno Prata / Preto | Aparelho usado revisado |
| Últimas unidades | `#FEF0C7` / `#B54708` | Restam até 2 unidades |
| Esgotado | Névoa / Ardósia | Sem estoque |

### 3.5 Ícones

- Traço de 1,75px com cantos arredondados, grade de 24px (Lucide ou Phosphor Regular).
- Nos benefícios, dentro de um círculo de 44px, como nos posts.
- Conjunto da marca: medalha (originalidade), escudo com ✓ (garantia), cartão (18x), setas circulares (troca), caminhão (entrega), headset (atendimento), WhatsApp.

---

## 4. Estética

### 4.1 Arredondamento (border-radius)

| Token | Valor | Onde |
|---|---|---|
| `--raio-xs` | 6px | Checkbox, tooltip |
| `--raio-sm` | 10px | Ícones em quadrado, especificações |
| `--raio-md` | 12px | Inputs, chips de opção, área da imagem, toasts |
| `--raio-lg` | 18px | Cards de benefício e de depoimento |
| `--raio-xl` | 22px | Card de produto |
| `--raio-2xl` | 30px | Banners, painéis, modal, card do hero |
| `--raio-pill` | 999px | Botões, busca, selos, amostras de cor, botão flutuante |

**Regra do aninhamento:** raio interno = raio externo − padding. Faixas de largura total ficam retas.

### 4.2 Sombras e elevação

**No fundo claro**

| Token | Valor | Onde |
|---|---|---|
| `--sombra-1` Repouso | `0 1px 2px rgba(10,32,108,.06), 0 6px 16px -6px rgba(10,32,108,.10)` | Cards de benefício, busca |
| `--sombra-2` Destaque | `0 18px 36px -18px rgba(7,77,255,.35)` | Hover do card de produto e do botão primário |
| `--sombra-3` Sobreposição | `0 32px 64px -24px rgba(5,10,30,.45)` | Modal, carrinho, toast |

**No fundo escuro:** a elevação vem da cor da superfície (Noite → Grafite → Aço) com borda Linha de 1px, sem sombra cinza.

| Token | Valor | Onde |
|---|---|---|
| `--brilho-azul` | `0 14px 32px -12px rgba(7,77,255,.70)` | Só o botão primário e o botão flutuante no escuro |

A sombra é sempre puxada para o azul-marinho, nunca preto neutro.

### 4.3 Espaçamentos e grid

Base de 4px. Escala: **4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96**.

| Uso | Valor |
|---|---|
| Dentro do componente (ícone ↔ texto, padding de chip) | 8–12px |
| Padding de card | 10px (produto) · 24px (benefício e painel) |
| Entre itens relacionados (título ↔ texto) | 12–16px |
| Entre grupos (texto ↔ botões) | 24–32px |
| Entre cards de uma grade | 20px desktop · 16px tablet · 12px mobile |
| Entre seções | 96px desktop · 72px tablet · 56px mobile |

**Grid:** container de 1200px. Margem lateral de 16px (mobile), 24px (tablet) e 32px (desktop). 12 colunas no desktop. Vitrine de produtos com 4 colunas a partir de 1100px, 3 a partir de 900px e 2 no mobile. Cabeçalho de 72px e barra de avisos de 36px.

### 4.4 Arco Vellari

A seta ascendente do logo vira o elemento gráfico da marca e carrega a ideia de upgrade e conquista.

- Sempre da esquerda para a direita, subindo.
- Um por tela: sob o título do hero, em volta do aparelho (como no post "Fazemos upgrade!") ou como linha de progresso do pedido.
- Sempre no Gradiente Seta. Nunca em outra cor, nunca espelhado, nunca como padrão repetido ou marcador de lista.
- Largura mínima de 120px.

### 4.5 Imagens

- **Produto:** fundo claro, sombra suave no chão, aparelho centralizado com 10% de respiro.
- **Vitrine:** aparelho sobre Noite, com halo azul e brilho de borda.
- **Pessoas:** fotos reais de clientes com a caixa na mão, como no feed. Nada de banco de imagens.
- **Seminovos:** foto real do aparelho à venda e print da saúde da bateria.

### 4.6 Movimento

- 160ms para hover e foco. 240ms para abrir carrinho e modal. Curva `cubic-bezier(.2,.7,.2,1)`.
- O Arco é desenhado uma vez quando o hero carrega. Nada de animação em loop.
- Respeitar a preferência "reduzir movimento" do aparelho.

---

## 5. Conversão: autoridade e venda

### 5.1 Autoridade

1. **Mostre a loja física.** Endereço (Rua 19, nº 655, Centro, 2º andar, Santa Fé do Sul - SP), horário e fotos reais no rodapé e na página Sobre.
2. **Faixa de confiança perto do preço.** 100% originais · Garantia e suporte · Até 18x · Aceitamos seu usado.
3. **Prova social real.** Fotos de clientes do destaque "Clientes" e avaliações com nome e modelo. Nada de estrelas ou números inventados.
4. **Vocabulário de original.** Nunca use "réplica", "linha premium" ou "similar". O valor da marca é ser 100% original.
5. **Consistência.** O mesmo azul, a mesma seta e a mesma fonte no site e nos posts.

### 5.2 Conversão

1. **Um primário por tela.** No mobile, ele aparece sem rolar no hero e na página do produto.
2. **WhatsApp com mensagem pronta.** Todo botão de WhatsApp diz "WhatsApp" e já envia modelo, cor, armazenamento e cidade.
3. **Botão flutuante.** WhatsApp sempre visível no mobile (Azul Vellari, ícone branco, 56px). Some quando o carrinho ou o modal está aberto.
4. **Preço claro.** Com preço: valor à vista e a parcela em 18x. Sem preço: "Preço do dia no WhatsApp" e o motivo (o valor acompanha o dólar).
5. **Urgência só verdadeira.** "Últimas unidades" apenas quando restarem até 2.
6. **Formulário curto.** Nome, cidade e entrega. Sem cadastro.

### 5.3 Textos de ação

| Situação | Texto do botão | Mensagem que já vai pronta |
|---|---|---|
| Card de produto | Ver opções | — |
| Página do produto | Comprar pelo WhatsApp | "Olá, Vellari Phone! Vi no site e quero comprar: 1x iPhone 18 Pro · Azul Claro · 256 GB. Pode me passar o valor do dia?" |
| Carrinho | Finalizar pedido no WhatsApp | Itens + nome + cidade + entrega + pagamento |
| Troca | Enviar para avaliação no WhatsApp | Modelo, armazenamento, saúde da bateria e estado |
| Esgotado | Avise-me no WhatsApp | "Quero ser avisado quando o iPhone 17 Pro chegar." |
| Botão flutuante | Chama no WhatsApp | "Olá, Vellari Phone! Vim pelo site e quero atendimento." |

**Voz da marca:** segunda pessoa, "pra você", frases curtas, exclamação só em botão e oferta. Frases próprias da Vellari: "Novo iPhone, novas conquistas.", "A hora é agora!", "Fazemos upgrade!", "Tecnologia sempre com você", "Chama no WhatsApp".

### 5.4 Checklist antes de publicar uma página

- [ ] Existe só um botão primário por bloco.
- [ ] O botão de compra aparece sem rolar no celular.
- [ ] A faixa de confiança está perto do preço.
- [ ] Todo botão de WhatsApp diz "WhatsApp" e leva mensagem pronta.
- [ ] O azul ocupa no máximo 10% da tela.
- [ ] Os produtos estão em cards brancos.
- [ ] Os textos passam no contraste AA.
- [ ] Fotos de clientes e avaliações são reais.

---

## 6. Tokens (CSS)

```css
:root {
  /* Principal */
  --azul-vellari: #074DFF;
  --preto-vellari: #050505;
  --branco: #FFFFFF;

  /* Secundária */
  --azul-royal: #0237C9;
  --azul-royal-pressionado: #022EA8;
  --azul-marinho: #0A206C;
  --azul-brilho: #1E8CFF;

  /* Suporte: escuro */
  --noite: #070A12;
  --grafite: #0F1420;
  --aco: #1A2133;
  --linha: #263047;
  --borda-campo-escuro: #5E6A88;
  --neblina: #9AA5BF;

  /* Suporte: claro */
  --gelo: #F4F6FB;
  --nevoa: #E6EBF5;
  --prata: #C3CAD8;
  --borda-campo-claro: #848FA9;
  --ardosia: #5B6889;

  /* Azuis de apoio */
  --azul-claro: #5B8CFF;
  --azul-gelo: #E7EEFF;

  /* Funcionais */
  --sucesso: #067647;  --sucesso-fundo: #DCFAE6;  --sucesso-escuro: #47CD89;
  --alerta: #B54708;   --alerta-fundo: #FEF0C7;   --alerta-escuro: #FDB022;
  --erro: #B42318;     --erro-fundo: #FEE4E2;     --erro-escuro: #FF8A80;
  --online: #25D366;

  /* Gradientes */
  --gradiente-seta: linear-gradient(90deg, #0237C9 0%, #074DFF 55%, #1E8CFF 100%);
  --gradiente-oferta: linear-gradient(180deg, #0A206C 0%, #074DFF 100%);
  --halo-produto: radial-gradient(closest-side, rgba(7,77,255,.45), transparent);

  /* Tipografia */
  --fonte-marca: "Archivo", "Arial", system-ui, sans-serif;
  --fonte-assinatura: "Yellowtail", "Brush Script MT", cursive;

  /* Arredondamento */
  --raio-xs: 6px;  --raio-sm: 10px;  --raio-md: 12px;  --raio-lg: 18px;
  --raio-xl: 22px; --raio-2xl: 30px; --raio-pill: 999px;

  /* Sombras */
  --sombra-1: 0 1px 2px rgba(10,32,108,.06), 0 6px 16px -6px rgba(10,32,108,.10);
  --sombra-2: 0 18px 36px -18px rgba(7,77,255,.35);
  --sombra-3: 0 32px 64px -24px rgba(5,10,30,.45);
  --brilho-azul: 0 14px 32px -12px rgba(7,77,255,.70);

  /* Espaçamento */
  --esp-1: 4px;  --esp-2: 8px;  --esp-3: 12px; --esp-4: 16px;
  --esp-5: 20px; --esp-6: 24px; --esp-8: 32px; --esp-10: 40px;
  --esp-12: 48px; --esp-16: 64px; --esp-20: 80px; --esp-24: 96px;

  /* Movimento */
  --curva: cubic-bezier(.2,.7,.2,1);
  --rapido: 160ms;
  --medio: 240ms;
}
```

---

## 7. Referências analisadas

| Referência | Aproveitar | Evitar |
|---|---|---|
| Arsh Mobile | Hero escuro com catálogo claro, linha de categorias com ícones, faixa "Por que escolher" | Selo de desconto verde em todo card. O produto "réplica" contradiz o "100% original" |
| TechNest (app) | Busca em pílula no topo, botão de carrinho redondo, navegação inferior no mobile | Estrelas e contagem de avaliações sem dados reais |
| TechNova | Fluxo completo de produto, carrinho, checkout em etapas e acompanhamento do pedido; banner com frase manuscrita | Pagamento online que a loja não usa. O fechamento da Vellari é no WhatsApp |
| Posts da Vellari | Cards brancos com ícone em círculo, títulos pesados, seta azul, botão azul com o ícone do WhatsApp | Excesso de informação numa peça só. No site, um assunto por bloco |

---

## Tom visual

Vitrine de tecnologia premium com energia de loja perto de você: o preto e o branco dão a autoridade de uma loja Apple, e o azul elétrico da seta marca tudo que é ação.
Títulos largos e pesados, ofertas em itálico condensado e a seta ascendente do logo repetem a ideia de upgrade e conquista.
Superfícies limpas, cantos bem arredondados e selos de confiança ao lado de cada preço deixam o cliente seguro para comprar no site ou chamar no WhatsApp.
