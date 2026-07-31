import { parseCatalogue, type Catalogue, type ParseResult } from "../schema";

// URL du Catalogue réel, généré par le scraper (story 1.9) et servi
// directement depuis la branche `main` du repo — jamais un chemin `public/`
// ni un import statique du JSON (AD-2, AC #5).
export const CATALOGUE_URL = "https://raw.githubusercontent.com/jsoulet/pokebrets/main/data/catalogue.json";

// [Review] Délai maximal avant d'abandonner la requête — un réseau capricieux
// (le cas d'usage même de cette story, "en rayon") peut ne jamais répondre ;
// sans timeout, le hook resterait bloqué indéfiniment en `loading` (ou en
// revalidation silencieuse), ce qu'AD-3 ne prévoit pas comme état valide.
const FETCH_TIMEOUT_MS = 10_000;

// Unifie les 3 causes d'échec (réseau, réponse non-2xx, JSON hors schéma)
// dans le même résultat `{ success: false }` — jamais une exception qui
// remonte (AD-3). L'appelant (le hook `useCatalogue`) n'a jamais besoin de
// distinguer la nature de l'échec, seulement l'afficher.
export async function fetchCatalogue(): Promise<ParseResult<Catalogue>> {
  let response: Response;

  try {
    response = await fetch(CATALOGUE_URL, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return { success: false, error: [`Échec réseau : ${message}`] };
  }

  if (!response.ok) {
    return { success: false, error: [`Réponse HTTP ${response.status} depuis ${CATALOGUE_URL}`] };
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    return { success: false, error: [`JSON invalide : ${message}`] };
  }

  return parseCatalogue(body);
}
