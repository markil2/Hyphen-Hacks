/** Lower-case and strip accents so "puree" finds "Purée". */
export function fold(text: string) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
