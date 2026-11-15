import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/jetbrains-mono/wght.css';
import './styles/tokens.css';
import './styles/base.css';
import { initRastreamento } from './lib/rastreamento.ts';
import { initHeader } from './sections/header/index.ts';
import { initHero } from './sections/hero/index.ts';
import { initPagina } from './sections/pagina/index.ts';
import { initProdutos } from './sections/produtos/index.ts';

initHeader();
initHero();
initProdutos();
initPagina();
initRastreamento();
