/** Brazilian zones first (with friendly names), then every other IANA zone. */
const BRAZIL: [string, string][] = [
  ["America/Sao_Paulo", "Brasília, São Paulo, Rio, Sul e Sudeste"],
  ["America/Manaus", "Manaus, Amazonas"],
  ["America/Cuiaba", "Cuiabá, Mato Grosso"],
  ["America/Campo_Grande", "Campo Grande, Mato Grosso do Sul"],
  ["America/Porto_Velho", "Porto Velho, Rondônia"],
  ["America/Boa_Vista", "Boa Vista, Roraima"],
  ["America/Rio_Branco", "Rio Branco, Acre"],
  ["America/Belem", "Belém, Pará e Amapá"],
  ["America/Fortaleza", "Fortaleza, Nordeste"],
  ["America/Recife", "Recife, Pernambuco"],
  ["America/Bahia", "Salvador, Bahia"],
  ["America/Noronha", "Fernando de Noronha"],
];

export type TimeZoneOptions = { brazil: [string, string][]; others: string[] };

/** Computed on the server and passed to client forms, so server and browser render the same list. */
export function timeZoneOptions(): TimeZoneOptions {
  const brazilIds = new Set(BRAZIL.map(([id]) => id));
  const others = Intl.supportedValuesOf("timeZone").filter((z) => !brazilIds.has(z));
  if (!others.includes("UTC")) others.push("UTC");
  return { brazil: BRAZIL, others };
}
