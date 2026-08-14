"use client";

// [Review pattern] Défense en profondeur AD-4, en miroir de
// `lib/tasted/cache.ts` : ce module touche `localStorage` directement.
// `index.ts` (qui l'importe) porte déjà `'use client'`, mais un import
// direct futur de ce fichier hors de `lib/rating/` doit lui aussi échouer
// explicitement à la compilation plutôt qu'à l'exécution.
import { parseRatingState, type RatingState } from "../schema";

// Namespace dédié, distinct de `crounch:tasted` et `crounch:catalogue`
// (Story 2.1 — indépendance stricte des deux états, AC #5).
export const RATING_STORAGE_KEY = "crounch:rating";

// Même garantie qu'`lib/tasted/cache.ts` (AD-3) : un stockage absent,
// illisible, invalide contre le schéma, ou un accès `localStorage` qui
// échoue sont tous traités comme "aucune Saveur notée" — jamais un throw.
export function readRatingState(): RatingState {
  let raw: string | null;

  try {
    raw = localStorage.getItem(RATING_STORAGE_KEY);
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

  const result = parseRatingState(parsedJson);

  return result.success ? result.data : {};
}

// Fonction canonique unique de mutation (miroir de `setTasted()`, AD-8) :
// relit toujours l'état persistant le plus récent juste avant d'écrire.
//
// Persistance en map sparse : une note retirée (`value === null`) est
// supprimée de la map plutôt que stockée à `0` — l'absence de clé signifie
// "non notée" (Story 2.1, anti-pattern à éviter).
export function setRating(id: string, value: number | null): RatingState {
  const current = readRatingState();
  const nextState: RatingState = { ...current };

  if (value === null) {
    delete nextState[id];
  } else {
    nextState[id] = value;
  }

  try {
    localStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(nextState));
  } catch {
    // Dégradation silencieuse intentionnelle, comme `setTasted()` : un échec
    // d'écriture ne doit jamais faire planter le hook appelant.
  }

  return nextState;
}
