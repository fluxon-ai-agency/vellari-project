/* Seções de conteúdo: benefícios, loja, clientes, entrega, Instagram, FAQ, CTA final,
   rodapé, botão flutuante e banner de cookies. Todos os dados vêm de src/data/store.ts. */
import { enderecoCompleto, store } from '../../data/store.ts';
import { linkOrigem } from '../../lib/whatsapp.ts';
import { esc, icone, picture, temImagem } from '../../render/html.ts';

const whatsGeral = linkOrigem('geral');
const cidades = store.entrega.cidades;
const listaCidades = `${cidades.slice(0, -1).join(', ')} e ${cidades[cidades.length - 1]}`;

/** Endereço para a busca do Google Maps (só o que já foi confirmado). */
const enderecoMapa = `${store.nome}, ${enderecoCompleto()}`;
export const linkMaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoMapa)}`;
export const mapaEmbed = `https://www.google.com/maps?q=${encodeURIComponent(enderecoMapa)}&output=embed`;

const botaoWhats = (rotulo: string, local: string, classe = 'btn btn-primario btn-g', href = whatsGeral, origem = 'geral') =>
  `<a class="${classe}" data-wa="${origem}" data-wa-local="${local}" href="${href}" target="_blank" rel="noopener">${icone('whatsapp')}${esc(rotulo)}</a>`;

/* ---------- Faixa de benefícios ---------- */
export function beneficiosSection(): string {
  const itens = [
    { ic: 'escudo', titulo: '1 ano de garantia nos lacrados', texto: 'iPhone lacrado sai da loja com 1 ano de garantia.' },
    { ic: 'medalha', titulo: '3 meses de garantia nos seminovos', texto: 'Seminovo também tem garantia: 3 meses.' },
    { ic: 'cartao', titulo: 'Até 18x no cartão', texto: `Crédito ${store.pagamento.parcelamento}.` },
    { ic: 'carteira', titulo: 'Pix, débito e dinheiro', texto: 'Pague do jeito que for melhor pra você.' },
    { ic: 'caminhao', titulo: 'Entregamos na região', texto: `${store.endereco.cidade} e cidades vizinhas.` },
  ];
  return `
<section class="faixa-beneficios" aria-label="Por que comprar com a gente">
  <div class="container">
    <ul class="beneficios">
      ${itens.map((b) => `<li class="beneficio"><span class="circ">${icone(b.ic)}</span><h2>${esc(b.titulo)}</h2><p>${esc(b.texto)}</p></li>`).join('')}
    </ul>
  </div>
</section>`;
}

/* ---------- A loja / Por que comprar na Vellari ---------- */
export function lojaSection(): string {
  const motivos = [
    { ic: 'escudo', titulo: 'Garantia de verdade', texto: 'Lacrados com 1 ano de garantia. Seminovos com 3 meses.' },
    { ic: 'cartao', titulo: 'Pagamento do seu jeito', texto: `Pix, débito, dinheiro ou crédito ${store.pagamento.parcelamento}.` },
    { ic: 'caminhao', titulo: 'Entrega na região', texto: `Levamos seu aparelho em ${store.endereco.cidade} e cidades vizinhas.` },
    { ic: 'headset', titulo: 'Atendimento direto', texto: 'Você fala com a loja pelo WhatsApp, de segunda a sábado.' },
    { ic: 'loja', titulo: 'Loja física no Centro', texto: `Venha ver os aparelhos de perto, em ${store.endereco.cidade}.` },
    { ic: 'celular', titulo: 'Lacrados e seminovos', texto: 'iPhones para todo bolso, sempre com a garantia informada.' },
  ];
  // Sem foto de fachada, entrada ou balcão em assets/: fica o bloco neutro até a loja enviar.
  const foto = temImagem('loja')
    ? picture('loja', { sizes: '(min-width: 900px) 520px, 92vw', alt: `Loja da ${store.nome} em ${store.endereco.cidade}` })
    : `<div class="placeholder-foto">${icone('loja')}<strong>Foto da loja em breve</strong></div>`;
  return `
<section class="secao" id="loja" aria-labelledby="titulo-loja">
  <div class="container sobre-grid">
    <div>
      <div class="cabecalho-secao" style="margin-bottom:0">
        <p class="selo-phone">Por que a Vellari</p>
        <h2 class="t-h2" id="titulo-loja">Comprar iPhone com segurança, aqui em ${esc(store.endereco.cidade)}</h2>
        <p class="lead">Loja no Centro, atendimento pelo WhatsApp e aparelho na sua mão sem complicação.</p>
      </div>
      <ul class="motivos">
        ${motivos.map((m) => `<li class="motivo"><span class="circ">${icone(m.ic)}</span><div><h3>${esc(m.titulo)}</h3><p>${esc(m.texto)}</p></div></li>`).join('')}
      </ul>
    </div>
    <aside class="loja-fisica" aria-label="Loja física">
      <div class="foto-loja">${foto}</div>
      <div class="endereco-card">
        <span class="circ">${icone('pino')}</span>
        <div>
          <strong>${esc(store.nome)}</strong>
          <p>${esc(enderecoCompleto())}</p>
          <p>${esc(store.horario.texto)}</p>
          <a class="btn-texto" href="${linkMaps}" target="_blank" rel="noopener">Como chegar no Google Maps</a>
        </div>
      </div>
    </aside>
  </div>
</section>`;
}

/* ---------- Clientes Vellari ---------- */
export function clientesSection(): string {
  // Só fotos de assets/, da fase Vellari. Todas vão para o relatório, para autorização (LGPD).
  const fotos = ['cliente-01', 'cliente-02'].filter(temImagem);
  if (fotos.length === 0) return '';
  return `
<section class="secao" id="clientes" aria-labelledby="titulo-clientes">
  <div class="container">
    <div class="cabecalho-secao">
      <p class="selo-phone">Clientes Vellari</p>
      <h2 class="t-h2" id="titulo-clientes">Quem já saiu de aparelho novo</h2>
      <p class="lead">Clientes da ${esc(store.nome)} com o celular novo na mão.</p>
    </div>
    <ul class="clientes">
      ${fotos.map((id) => `<li><figure class="foto-cliente">${picture(id, { sizes: '(min-width: 760px) 300px, 46vw' })}</figure></li>`).join('')}
    </ul>
    <a class="btn btn-contorno" href="${store.instagram.url}" target="_blank" rel="noopener">${icone('instagram')}Ver mais no Instagram</a>
  </div>
</section>`;
}

/* ---------- Entregamos na sua cidade ---------- */
export function entregaSection(): string {
  const padrao = cidades[0];
  return `
<section class="secao" id="entrega" aria-labelledby="titulo-entrega">
  <div class="container entrega-grid">
    <div class="cabecalho-secao" style="margin-bottom:0">
      <p class="selo-phone">Entrega</p>
      <h2 class="t-h2" id="titulo-entrega">Entregamos na sua cidade</h2>
      <p class="lead">${esc(store.entrega.titulo)}: ${esc(listaCidades)}. Escolha sua cidade e combine a entrega pelo WhatsApp.</p>
    </div>
    <div class="entrega-acao">
      <div class="chips" role="radiogroup" aria-label="Sua cidade">
        ${cidades
          .map(
            (c) => `<label class="chip"><input type="radio" name="cidade" value="${esc(c)}"${c === padrao ? ' checked' : ''}><span>${esc(c)}</span></label>`,
          )
          .join('')}
      </div>
      <a class="btn btn-primario btn-g" id="entrega-cta" data-wa="entrega" data-wa-local="entrega" href="${linkOrigem('entrega', { cidade: padrao })}" target="_blank" rel="noopener">
        ${icone('whatsapp')}Consultar entrega no WhatsApp
      </a>
      <p class="legenda texto-2">Prazo e valor da entrega você combina direto com a loja.</p>
    </div>
  </div>
</section>`;
}

/* ---------- Instagram ---------- */
export function instagramSection(): string {
  return `
<section class="secao" id="instagram" aria-labelledby="titulo-insta">
  <div class="container insta-topo">
    <div class="cabecalho-secao" style="margin-bottom:0">
      <p class="selo-phone">Instagram</p>
      <h2 class="t-h2" id="titulo-insta">Siga ${esc(store.instagram.usuario)}</h2>
      <p class="lead">Novidades da loja e os aparelhos que acabaram de chegar.</p>
    </div>
    <a class="btn btn-contorno btn-g" href="${store.instagram.url}" target="_blank" rel="noopener">${icone('instagram')}Seguir no Instagram</a>
  </div>
</section>`;
}

/* ---------- FAQ: respostas baseadas só nos dados oficiais ---------- */
export const FAQ = [
  { pergunta: 'Qual a garantia?', resposta: `iPhones lacrados têm ${store.garantia.Lacrado}. iPhones seminovos têm ${store.garantia.Seminovo}.` },
  { pergunta: 'Quais as formas de pagamento?', resposta: store.pagamento.resumo },
  { pergunta: 'Vocês entregam?', resposta: `Sim. Atendemos ${listaCidades}. Os detalhes da entrega você combina pelo WhatsApp.` },
  { pergunta: 'Qual o horário de atendimento?', resposta: store.horario.texto },
  // "Aceitam iPhone usado na troca?": só entra quando a loja confirmar.
];

export function faqSection(): string {
  return `
<section class="secao" id="duvidas" aria-labelledby="titulo-faq">
  <div class="container faq-grid">
    <div class="faq-cta">
      <p class="selo-phone">Dúvidas</p>
      <h2 class="t-h2" id="titulo-faq">Perguntas frequentes</h2>
      <p class="texto-2">Não achou sua resposta? A gente responde pelo WhatsApp.</p>
      ${botaoWhats('Tirar dúvida no WhatsApp', 'faq')}
    </div>
    <div class="faq-lista">
      ${FAQ.map((f) => `<details><summary>${esc(f.pergunta)}${icone('seta-baixo')}</summary><div class="resposta"><p>${esc(f.resposta)}</p></div></details>`).join('')}
    </div>
  </div>
</section>`;
}

/* ---------- CTA final ---------- */
export function ctaFinalSection(): string {
  return `
<section class="secao cta-final" aria-labelledby="titulo-cta">
  <div class="container">
    <div class="cta-final-inner">
      <p class="selo-phone">Atendimento</p>
      <h2 class="t-h2" id="titulo-cta">Seu próximo iPhone está a uma mensagem de distância</h2>
      <p class="lead">Fale qual modelo você quer. A gente passa cores, armazenamento, valores e parcelamento.</p>
      <div class="cta-botoes">
        ${botaoWhats('Chama no WhatsApp', 'cta-final')}
        <a class="btn btn-contorno btn-g" href="#vitrine">Ver a vitrine</a>
      </div>
    </div>
  </div>
</section>`;
}

/* ---------- Rodapé ---------- */
export function rodape(): string {
  const agencia = store.agencia.url
    ? `<a href="${esc(store.agencia.url)}" target="_blank" rel="noopener">${esc(store.agencia.nome)}</a>`
    : esc(store.agencia.nome);
  return `
<footer class="rodape" id="contato">
  <div class="container rodape-grid">
    <div class="marca">
      <a class="logo" href="#inicio" aria-label="${esc(store.nome)}, voltar ao início">${picture('logo-vellari', { sizes: '140px', alt: store.nome })}</a>
      <p>${esc(store.descricao)}</p>
    </div>
    <div>
      <h2>Loja</h2>
      <ul>
        <li class="linha-ic">${icone('pino')}<span>${esc(enderecoCompleto())}</span></li>
        <li class="linha-ic">${icone('relogio')}<span>${esc(store.horario.texto)}</span></li>
        <li><a class="btn-texto" href="${linkMaps}" target="_blank" rel="noopener">Abrir no Google Maps</a></li>
      </ul>
    </div>
    <div>
      <h2>Atendimento</h2>
      <ul>
        <li class="linha-ic">${icone('whatsapp')}<a class="btn-texto" data-wa="geral" data-wa-local="rodape" href="${whatsGeral}" target="_blank" rel="noopener">${esc(store.whatsapp.exibicao)}</a></li>
        <li class="linha-ic">${icone('email')}<a class="btn-texto" href="mailto:${esc(store.email)}">${esc(store.email)}</a></li>
        <li class="linha-ic">${icone('instagram')}<a class="btn-texto" href="${store.instagram.url}" target="_blank" rel="noopener">${esc(store.instagram.usuario)}</a></li>
      </ul>
    </div>
    <div>
      <h2>Como chegar</h2>
      <div class="mapa" id="mapa" data-src="${esc(mapaEmbed)}">
        <div class="mapa-estatico">
          <span class="pino">${icone('pino')}</span>
          <strong>${esc(store.endereco.rua)}, ${esc(store.endereco.bairro)}</strong>
          <span>${esc(store.endereco.cidade)} - ${esc(store.endereco.uf)}</span>
          <a class="btn-texto" href="${linkMaps}" target="_blank" rel="noopener">Ver no Google Maps</a>
        </div>
      </div>
    </div>
  </div>
  <div class="container rodape-base">
    <p>© <span id="ano">2026</span> ${esc(store.nome)} · CNPJ ${esc(store.cnpj)}</p>
    <p>${esc(store.avisoMarca)}</p>
    <p>Site por ${agencia}</p>
  </div>
</footer>`;
}

/* ---------- Botão flutuante do WhatsApp e banner de cookies ---------- */
export function flutuantes(): string {
  return `
<div class="wa-flutuante" id="wa-flutuante" data-visivel="0">
  <span class="wa-nota" id="wa-nota" hidden>${esc(store.horario.notaForaDoHorario)}</span>
  <a class="wa-botao" data-wa="geral" data-wa-local="flutuante" href="${whatsGeral}" target="_blank" rel="noopener" aria-label="Chama no WhatsApp">
    ${icone('whatsapp')}<span class="texto">Chama no WhatsApp</span>
  </a>
</div>
<div class="cookies" id="cookies" role="region" aria-label="Aviso de cookies" hidden>
  <p>Usamos cookies de medição para entender as visitas e melhorar o site. Você aceita?</p>
  <div class="cookies-botoes">
    <button class="btn btn-contorno btn-p" type="button" data-cookies="recusado">Recusar</button>
    <button class="btn btn-escuro btn-p" type="button" data-cookies="aceito">Aceitar</button>
  </div>
</div>`;
}
