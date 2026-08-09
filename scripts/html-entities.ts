// Décodage minimal des entités HTML rencontrées dans les titres de produits
// bruts de l'API WordPress de brets.fr (ex: "Ail Confit &#038; Herbes de
// Provence"). Volontairement pas de nouvelle dépendance : la liste d'entités
// nommées nécessaires est petite et fermée (noms de recettes en français).
const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00a0",
  eacute: "é",
  egrave: "è",
  ecirc: "ê",
  euml: "ë",
  agrave: "à",
  acirc: "â",
  ccedil: "ç",
  ocirc: "ô",
  ucirc: "û",
  ugrave: "ù",
  icirc: "î",
  iuml: "ï",
  rsquo: "\u2019",
  lsquo: "\u2018",
  rdquo: "\u201d",
  ldquo: "\u201c",
  hellip: "\u2026",
  ndash: "\u2013",
  mdash: "\u2014",
};

export function decodeHtmlEntities(input: string): string {
  return input.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g, (match, entity: string) => {
    if (entity.startsWith("#x") || entity.startsWith("#X")) {
      return safeFromCodePoint(Number.parseInt(entity.slice(2), 16), match);
    }

    if (entity.startsWith("#")) {
      return safeFromCodePoint(Number.parseInt(entity.slice(1), 10), match);
    }

    return NAMED_ENTITIES[entity] ?? match;
  });
}

// Un point de code hors plage Unicode valide (ex: `&#99999999;`, dérive
// possible côté brets.fr) ne doit jamais faire planter tout le scrape —
// on préserve l'entité brute plutôt que de laisser `String.fromCodePoint`
// lever un `RangeError` non catché (cf. revue de code story 1.9).
function safeFromCodePoint(codePoint: number, fallback: string): string {
  try {
    return String.fromCodePoint(codePoint);
  } catch {
    return fallback;
  }
}
