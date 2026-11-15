import './header.css';

const ICONE = (nome: string) => `<svg class="ic" aria-hidden="true" focusable="false"><use href="#i-${nome}"/></svg>`;

export function initHeader(): void {
  const topo = document.getElementById('topo');
  const botao = document.getElementById('botao-menu');
  const menu = document.getElementById('menu-mobile');
  if (!topo || !botao || !menu) return;

  // Fica translúcido com blur depois de rolar um pouco
  const aoRolar = () => topo.classList.toggle('rolado', window.scrollY > 8);
  aoRolar();
  window.addEventListener('scroll', aoRolar, { passive: true });

  const alternar = (abrir: boolean) => {
    menu.hidden = !abrir;
    topo.classList.toggle('menu-aberto', abrir);
    botao.setAttribute('aria-expanded', String(abrir));
    botao.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
    botao.innerHTML = ICONE(abrir ? 'fechar' : 'menu');
  };
  botao.addEventListener('click', () => alternar(menu.hasAttribute('hidden')));
  menu.addEventListener('click', (e) => {
    if ((e.target as Element).closest('a')) alternar(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hasAttribute('hidden')) {
      alternar(false);
      botao.focus();
    }
  });
}
