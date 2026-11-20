# Contexto da sessão de desenvolvimento

Leia este arquivo antes de continuar o trabalho. Ele resume o que foi decidido e onde o projeto
parou, porque a conversa em que o site foi construído não vai junto com a pasta.

As regras permanentes do projeto estão em `CLAUDE.md` (o Claude Code lê sozinho). O briefing
original está em `PROMPT.md.txt`. As pendências para o cliente estão em `docs/relatorio-final.md`.

Última atualização: 15/11/2026.

## Onde o projeto parou

- As 7 fases do briefing foram feitas. As fases 0, 1 e 3 foram aprovadas pelo usuário.
- Testes: `npm run qa` passa 46 de 46; `npm run screenshots` passa 18 de 18.
- Lighthouse mobile medido na máquina original: Acessibilidade 100, Boas práticas 100, SEO 100,
  LCP 2,14 s, CLS 0, **Performance 69** (meta 85). O que pesa é a partida do 3D (ver abaixo).
- Hospedagem: Hostinger, plano Unlimited (vence em 16/11/2027), servidor no Brasil, site
  PHP/HTML. Em 20/11/2026 o `dist/` foi publicado em `public_html` (o `default.php` de
  exemplo da Hostinger foi apagado). Prévia da Hostinger:
  https://sociable-bisque-salmon-77.hostingersite.com/ (3D, vitrine, imagens e `.htaccess`
  conferidos).
- Pendente: o registro do domínio vellariphone.com (hPanel > Domínios > Configurar) pede os dados
  do titular, que o usuário preenche. Depois: esperar o DNS, ativar o SSL e o "Forçar HTTPS".
- Como publicar de novo: `npm run build`, compactar o conteúdo de `dist/` em dois `.zip` (resto e
  `img/`, menos de 10 MB cada, na pasta `publicar/`, fora do git) e enviar pelo Gerenciador de
  arquivos. O "Extrair" da Hostinger cria uma pasta com o nome do `.zip`: mova o conteúdo para
  `public_html` e apague as pastas e os `.zip` (eles ficam públicos).
- **No ar desde 20/11/2026: https://vellariphone.com** (domínio ativo até 20/11/2027, com a
  renovação automática desligada). HTTPS válido; o HTTP e o `www` já vão para o HTTPS pela CDN
  da Hostinger. Conferido no domínio: 3D, 26 produtos, nenhuma imagem quebrada, nenhum erro no
  console, 44 links de WhatsApp para 5517997220015, `og-vellari.jpg` e `sitemap.xml` com 200.
- PageSpeed Insights oficial (20/11/2026): celular 98 · 100 · 100 · 100 (LCP 1,7 s, TBT 0, CLS 0);
  computador 100 · 100 · 100 · 100. O 3D não ligou lá (só a marca `vellari-3d:checar-webgl`):
  os servidores do Google não têm placa de vídeo, então a nota mede o poster. A medição local
  com o 3D ligado (Performance 69) continua sendo a mais conservadora.
- A ideia de atrasar a partida do 3D não foi feita; só faz sentido se o usuário quiser melhorar
  a experiência em celular fraco, já que a nota oficial passou da meta.

## Mudanças de 20/11/2026 (pedidas pelo usuário)

- Hero: fundo com brilho azul forte atrás do aparelho que se apaga no preto (como a referência
  de iPhone em laranja que o usuário mandou, em azul); o aparelho abre na cor Glacial
  (`hero.corInicial`). Os posters e a imagem de prévia continuam como estavam.
- "Por que a Vellari": foto do Rafael, dono da loja, no lugar de "Foto da loja em breve"
  (moldura 4:5).
- Vitrine: fotos novas de `assets/media/novas_fotos_dos_iphones_na_vitrine/` (versões finais do
  18 Pro Max e do 18 Pro, iPhone 11 no mesmo cenário e uma 2ª foto para cada modelo que tinha só
  uma). O `vellari-iphone-11-pro-max-chatgpt.png` de lá é igual ao que já estava no site.
- Clientes: 5 fotos (3 novas, recortadas sem a sacola "Rafa Imports"). No celular viram uma
  fileira que se arrasta para o lado; no desktop, 5 lado a lado.
- Movimento: entrada do hero ao abrir, seções e cards subindo em sequência ao rolar, fotos que
  se acomodam na moldura, zoom na foto do card no hover e o brilho do hero "respirando".
  Desligado com "reduzir movimento".
- Esta pasta (`CUSTOMERS PROJECTS\VELLARI PHONE\vellari-site-3d`) não tem os originais do
  Instagram (`assets/media/stories`, `posts` e a pasta antiga da vitrine). O `npm run images`
  agora mantém as imagens já geradas quando o original não está na máquina.

## Decisões tomadas (premissas)

Na Fase 0 o usuário aprovou sem responder às perguntas abaixo, então valem estas premissas.
Qualquer uma pode mudar se o usuário pedir.

1. Fotos de produto: recortes das fotos de story de `assets/` em que o texto ficou de fora; o resto
   usa placeholder "Foto em breve". Em 15/11/2026 o usuário trocou as fotos dos iPhones (menos o
   iPhone 11) por imagens geradas por IA, em `assets/media/fotos-dos-iphones-da-vitrine/`; as do
   Gemini entram como 2ª foto da galeria do mesmo modelo.
2. Poster do hero: render do próprio modelo 3D, um por cor (não há foto do iPhone 18 Pro Max).
3. Clientes: só 2 fotos da fase Vellari (`cliente-01`, `cliente-02`). O usuário confirmou a
   autorização de uso (LGPD) em 15/11/2026. As 59 fotos com a marca antiga "Rafa Imports" não
   são usadas.
4. Sacola da loja (tem a silhueta de uma maçã): evitada nos recortes.
5. Sem carrinho, sem seção "Troca" e sem o selo "100% originais" do protótipo, porque não estão nos
   dados oficiais. Voltam se a loja confirmar.
6. Endereço sem número ("Rua 19, Centro"). O protótipo citava "nº 655, 2º andar", não confirmado.
7. Cores do iPhone 18 Pro Max: as do briefing (Bordô, Preto, Prata, Glacial).
8. Git: não estava instalado na máquina original, então não há commits por fase. Tudo entrou
   no primeiro commit, em 15/11/2026 (ver "Repositório" abaixo).

Outras decisões:

- Fotos reais de produto mostram a maçã dos aparelhos. A regra "sem logo da Apple" foi aplicada ao
  modelo 3D, aos gráficos e à imagem de prévia, não às fotos reais. Está como pergunta aberta no
  relatório.
- Bateria ficou fora dos hotspots do hero: o briefing não traz nenhum dado de bateria.
- Garantia só aparece em iPhones (é o que o briefing define). Android, relógio e acessórios mostram
  apenas "Lacrado" ou "Seminovo".
- Pergunta "Aceitam iPhone usado na troca?" fora do FAQ até a loja confirmar.

## O que se aprendeu sobre o 3D e a performance

- A partida do 3D tem 2 custos grandes: gerar a iluminação de estúdio (`PMREMGenerator.fromScene`,
  uma única chamada síncrona do Three.js) e compilar os shaders.
- Já foi feito: materiais consolidados em 2 programas de shader; shaders da `RoomEnvironment`
  compilados antes com `compileAsync`; o 3D não liga sem placa de vídeo; qualidade adaptativa
  (resolução cai e entra modo econômico em aparelho lento); `content-visibility` nas seções.
- Tentado e descartado: tirar o desfoque da iluminação (`sigma` 0) não mostrou ganho claro; o
  `size` do PMREM não tem efeito abaixo de 256 nessa versão do Three.js.
- A máquina original é lenta e instável (Intel HD 3000 de 2011; o índice de benchmark do Lighthouse
  variou entre 129 e 960). Por isso `scripts/lighthouse.mjs` calibra a lentidão simulada.
- Para medir cada etapa: `npm run dev` e abrir `http://localhost:5173/?medir3d`.

## Prévia publicada

Prévia atual (16/11/2026, com as fotos novas da vitrine):
https://claude.ai/artifact/PyUf35GJGK65xo7MpPg1Ja, publicada pela conta fluxon.ai.agency. A
antiga (https://claude.ai/artifact/1nKW7pBrMaenJmezz3rB7V) é da conta original e ficou
desatualizada.

`npm run previa` gera a cópia em `previa/` (fora do git): build com `--base ./`, caminhos
relativos, só WebP, sem o iframe do Google Maps (bloqueado no claude.ai), sem `.htaccess` e com
`noindex`. Depois é publicar `previa/index.html` com os demais arquivos da pasta.

## Repositório

- GitHub, privado: https://github.com/fluxon-ai-agency/vellari-site-3d (branch `main`).
- O envio é por SSH (chave "PC Vellari", em `~/.ssh/id_ed25519`). Nesta rede o login do GitHub
  pelo navegador (`gh auth login --web`) não funciona: o pedido que fecha o login é derrubado.
  O `gh` não está logado; para o dia a dia basta o `git` por SSH.
- Fica fora do repositório (`.gitignore`): `assets/media/` (originais, 1 GB), as folhas de
  contato da Fase 0 (rostos de clientes), `node_modules/`, `dist/` e `previa/`.

## Ambiente da máquina original

- Windows 10, PowerShell 5.1, Node 24, Chrome e Edge instalados, sem git.
- Os scripts de teste usam o Chrome ou o Edge instalado (pacote `playwright-core`, sem baixar
  navegador). Os testes ligam o 3D com `?3d=1`, porque o Chrome sem interface não tem placa de vídeo.
