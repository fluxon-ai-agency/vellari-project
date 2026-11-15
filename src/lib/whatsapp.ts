import { store } from '../data/store.ts';

export type OrigemWhats = keyof typeof store.mensagens;

/** Troca {chaves} do template e limpa espaços que sobram quando um campo vem vazio. */
export function preencher(template: string, valores: Record<string, string | null | undefined> = {}): string {
  return template
    .replace(/\{([^}]+)\}/g, (_, chave: string) => valores[chave] ?? '')
    .replace(/\(\s*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([.,!?])/g, '$1')
    .trim();
}

/** Link no formato https://wa.me/5517997220015?text=<mensagem codificada> */
export function linkWhats(mensagem: string): string {
  return `https://wa.me/${store.whatsapp.numero}?text=${encodeURIComponent(mensagem)}`;
}

export function mensagem(origem: OrigemWhats, valores?: Record<string, string | null | undefined>): string {
  return preencher(store.mensagens[origem], valores);
}

export function linkOrigem(origem: OrigemWhats, valores?: Record<string, string | null | undefined>): string {
  return linkWhats(mensagem(origem, valores));
}
