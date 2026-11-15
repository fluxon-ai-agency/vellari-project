import { store } from '../data/store.ts';

const minutos = (hhmm: string) => {
  const [h = 0, m = 0] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** A loja está aberta agora? Sempre no fuso de São Paulo, não no do visitante. */
export function lojaAberta(agora: Date = new Date()): boolean {
  const h = store.horario;
  const partes = new Intl.DateTimeFormat('en-US', { timeZone: h.fuso, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(agora);
  const valor = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? '';
  const dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(valor('weekday'));
  const agoraMin = Number(valor('hour')) * 60 + Number(valor('minute'));
  return (h.diasAbertos as readonly number[]).includes(dia) && agoraMin >= minutos(h.abre) && agoraMin < minutos(h.fecha);
}
