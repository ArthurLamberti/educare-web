/**
 * Parses pasted "palavra;tradução" lines for adding many cards at once. Shared by the form (live
 * preview) and the Server Action (the check that counts). Only the first ";" separates the sides, so
 * a translation may contain more semicolons. Blank lines are ignored.
 */

export const MAX_BATCH = 500;
const MAX_SIDE = 1000;

export type ParsedCards = {
  cards: { front: string; back: string }[];
  /** 1-based line number of each card in the pasted text, to point API errors back to a line. */
  lines: number[];
  errors: string[];
};

export function parseCardLines(text: string): ParsedCards {
  const result: ParsedCards = { cards: [], lines: [], errors: [] };
  text.split(/\r?\n/).forEach((raw, index) => {
    const line = raw.trim();
    if (!line) return;
    const n = index + 1;
    const separator = line.indexOf(";");
    if (separator < 0) {
      result.errors.push(`Linha ${n}: falta o ponto e vírgula entre a palavra e a tradução.`);
      return;
    }
    const front = line.slice(0, separator).trim();
    const back = line.slice(separator + 1).trim();
    if (!front) result.errors.push(`Linha ${n}: falta a palavra antes do ponto e vírgula.`);
    else if (!back) result.errors.push(`Linha ${n}: falta a tradução depois do ponto e vírgula.`);
    else if (front.length > MAX_SIDE || back.length > MAX_SIDE) result.errors.push(`Linha ${n}: a palavra e a tradução podem ter no máximo ${MAX_SIDE} caracteres.`);
    else {
      result.cards.push({ front, back });
      result.lines.push(n);
    }
  });
  if (result.cards.length + result.errors.length > MAX_BATCH) result.errors.unshift(`No máximo ${MAX_BATCH} palavras por vez.`);
  return result;
}
