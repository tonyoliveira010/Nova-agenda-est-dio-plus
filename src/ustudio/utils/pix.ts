// @ts-nocheck -- ported as-is from the original AI Studio project
export function crc16(s: string): string {
  let c = 0xffff;
  for (let i = 0; i < s.length; i++) {
    c ^= s.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      c = c & 0x8000 ? ((c << 1) ^ 0x1021) & 0xffff : (c << 1) & 0xffff;
    }
  }
  return c.toString(16).toUpperCase().padStart(4, '0');
}

export function parseTLV(s: string): Array<{ id: string; val: string }> {
  const out: Array<{ id: string; val: string }> = [];
  let i = 0;
  while (i + 4 <= s.length) {
    const id = s.slice(i, i + 2);
    const len = parseInt(s.slice(i + 2, i + 4), 10);
    if (isNaN(len) || i + 4 + len > s.length) break;
    out.push({ id, val: s.slice(i + 4, i + 4 + len) });
    i += 4 + len;
  }
  return out;
}

export const noAccent = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '');

export function normKey(k: string) {
  const trimmed = k.trim();
  return trimmed.includes('@') ? trimmed.toLowerCase() : trimmed;
}

/* Se o campo da chave receber um "copia e cola" completo, extrai chave, nome e cidade */
export function absorbPayload(raw: string): { key?: string; name?: string; city?: string } | null {
  const trimmed = raw.trim();
  if (!/^0002/.test(trimmed)) return null;
  const t = parseTLV(trimmed);
  const g = (id: string) => (t.find((x) => x.id === id) || {}).val || '';
  const key = (parseTLV(g('26')).find((x) => x.id === '01') || {}).val;
  if (!key) return null;
  return {
    key,
    name: g('59') || undefined,
    city: g('60') || undefined,
  };
}

/* Monta o BR Code estático (Pix copia e cola) com valor e calcula o CRC16 */
export function buildPix(params: { key: string; name: string; city: string; amount: number }): string {
  const key = normKey(params.key);
  const name = noAccent(params.name).trim().slice(0, 25);
  const city = noAccent(params.city).trim().toUpperCase().slice(0, 15);

  const f = (id: string, v: string) => id + String(v.length).padStart(2, '0') + v;
  const body =
    f('00', '01') +
    f('01', '11') +
    f('26', f('00', 'BR.GOV.BCB.PIX') + f('01', key)) +
    f('52', '0000') +
    f('53', '986') +
    f('54', params.amount.toFixed(2)) +
    f('58', 'BR') +
    f('59', name) +
    f('60', city) +
    f('62', f('05', '***')) +
    '6304';
  return body + crc16(body);
}
