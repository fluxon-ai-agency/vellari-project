# Contexto da sessão de desenvolvimento

Leia este arquivo antes de continuar o trabalho. Ele resume o que foi decidido e onde o projeto
parou, porque a conversa em que o site foi construído não vai junto com a pasta.

As regras permanentes do projeto estão em `CLAUDE.md` (o Claude Code lê sozinho). O briefing
original está em `PROMPT.md.txt`. As pendências para o cliente estão em `docs/relatorio-final.md`.

Última atualização: 14/11/2026.

## Onde o projeto parou

- As 7 fases do briefing foram feitas. As fases 0, 1 e 3 foram aprovadas pelo usuário.
- Testes: `npm run qa` passa 46 de 46; `npm run screenshots` passa 18 de 18.
- Lighthouse mobile medido na máquina original: Acessibilidade 100, Boas práticas 100, SEO 100,
  LCP 2,14 s, CLS 0, **Performance 69** (meta 85). O que pesa é a partida do 3D (ver abaixo).
- Próximo passo combinado: o usuário publica o site na hospedagem dele e manda o endereço. Aí:
  1. rodar o PageSpeed Insights (pagespeed.web.dev) no endereço publicado, celular e computador;
  2. conferir no relatório se o 3D chegou a ligar (os servidores do Google provavelmente não têm
     placa de vídeo, e sem ela o site fica no poster de propósito);
  3. testar os links de WhatsApp no site publicado.
- Se a Performance oficial ficar abaixo de 85, a alternativa discutida foi atrasar a partida do 3D
  alguns segundos (custo: o poster fica mais tempo na tela). Não foi feita; depende do usuário.

## Decisões tomadas (premissas)

Na Fase 0 o usuário aprovou sem responder às perguntas abaixo, então valem estas premissas.
Qualquer uma pode mudar se o usuário pedir.

1. Fotos de produto: recortes das fotos de story de `assets/` em que o texto ficou de fora; o resto
   usa placeholder "Foto em breve".
2. Poster do hero: render do próprio modelo 3D, um por cor (não há foto do iPhone 18 Pro Max).
3. Clientes: só 2 fotos da fase Vellari (`cliente-01`, `cliente-02`), ainda **sem autorização de
   uso confirmada** (LGPD). As 59 fotos com a marca antiga "Rafa Imports" não são usadas.
4. Sacola da loja (tem a silhueta de uma maçã): evitada nos recortes.
5. Sem carrinho, sem seção "Troca" e sem o selo "100% originais" do protótipo, porque não estão nos
   dados oficiais. Voltam se a loja confirmar.
6. Endereço sem número ("Rua 19, Centro"). O protótipo citava "nº 655, 2º andar", não confirmado.
7. Cores do iPhone 18 Pro Max: as do briefing (Bordô, Preto, Prata, Glacial).
8. Git: não estava instalado na máquina original; não há histórico de commits.

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

Existe uma prévia em https://claude.ai/artifact/1nKW7pBrMaenJmezz3rB7V, publicada pela conta
original. Outra conta não consegue atualizá-la; se precisar de uma nova prévia, publique outra.
A cópia usada nela é gerada na pasta `previa/` (fora do git): build com `--base ./`, caminhos
relativos, só WebP, sem o iframe do Google Maps (bloqueado no claude.ai) e com `noindex`.

## Ambiente da máquina original

- Windows 10, PowerShell 5.1, Node 24, Chrome e Edge instalados, sem git.
- Os scripts de teste usam o Chrome ou o Edge instalado (pacote `playwright-core`, sem baixar
  navegador). Os testes ligam o 3D com `?3d=1`, porque o Chrome sem interface não tem placa de vídeo.
