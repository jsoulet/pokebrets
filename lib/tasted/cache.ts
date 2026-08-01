"use client";

// [Review pattern] Défense en profondeur AD-4 : ce module touche
// `localStorage` directement. `index.ts` (qui l'importe) porte déjà
// `'use client'`, mais un import direct futur de ce fichier hors de
// `lib/tasted/` doit lui aussi échouer explicitement à la compilation
// plutôt qu'à l'exécution.
import { parseTastedState, type TastedState } from "../schema";

// Namespace dédié pour éviter toute collision avec la clé du cache Catalogue
// (lib/catalogue/, "crounch:catalogue").
export const TASTED_STORAGE_KEY = "crounch:tasted";

// Un stockage absent, illisible, invalide contre le schéma, ou un accès
// `localStorage` qui échoue (Safari mode privé, etc.) sont tous traités
// comme "aucune Saveur goûtée" — jamais un throw (AD-3), sur le même
// pattern que `lib/catalogue/cache.ts` (Story 1.3).
export function readTastedState(): TastedState {
  let raw: string | null;

  try {
    raw = localStorage.getItem(TASTED_STORAGE_KEY);
  } catch {
    return {};
  }

  if (raw === null) {
    return {};
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return {};
  }

  const result = parseTastedState(parsedJson);

  return result.success ? result.data : {};
}

// Fonction canonique unique de mutation (AC #3, AD-8) : relit toujours
// l'état persistant le plus récent juste avant d'écrire, plutôt que de faire
// confiance à un snapshot React potentiellement périmé passé par l'appelant.
// Ceci évite qu'un read-modify-write basé sur un état obsolète (deux toggles
// rapprochés, deux onglets) n'écrase une mutation concurrente.
//
// Persistance en map sparse : une Saveur décochée est supprimée de la map
// plutôt que stockée à `false` — l'absence de clé signifie "pas goûtée".
// Ceci garde le payload petit et reste valide contre `tastedStateSchema`
// (AD-7) sans introduire de second schéma ni de forme parallèle.
export function setTasted(id: string, next: boolean): TastedState {
  const current = readTastedState();
  const nextState: TastedState = { ...current };

  if (next) {
    nextState[id] = true;
  } else {
    delete nextState[id];
  }

  try {
    localStorage.setItem(TASTED_STORAGE_KEY, JSON.stringify(nextState));
  } catch {
    // Dégradation silencieuse intentionnelle, comme `writeCache()` (Story 1.3) :
    // un échec d'écriture (quota dépassé, etc.) ne doit jamais faire planter
    // le hook appelant. Le snapshot normalisé est tout de même retourné pour
    // que l'UI reste cohérente pour la session courante, même sans persistance.
  }

  return nextState;
}
