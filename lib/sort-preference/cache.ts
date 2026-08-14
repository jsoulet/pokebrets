"use client";

// Défense en profondeur (AD-4), en miroir de `lib/tasted/cache.ts` : ce
// module touche `localStorage` directement.
import { parseSortMode, type SortMode } from "../schema";

// Namespace dédié, distinct de `crounch:tasted`/`crounch:rating`/
// `crounch:catalogue` (Story 2.2 — chaque feature garde son propre
// namespace, jamais de clé partagée entre modules).
export const SORT_PREFERENCE_STORAGE_KEY = "crounch:sort-preference";

const DEFAULT_SORT_MODE: SortMode = "alphabetical";

// Un stockage absent, illisible, invalide contre le schéma, ou un accès
// `localStorage` qui échoue sont tous traités comme "aucune préférence" et
// retombent sur le défaut "alphabetical" (AD-3, AC #4) — jamais un throw.
export function readSortMode(): SortMode {
  let raw: string | null;

  try {
    raw = localStorage.getItem(SORT_PREFERENCE_STORAGE_KEY);
  } catch {
    return DEFAULT_SORT_MODE;
  }

  if (raw === null) {
    return DEFAULT_SORT_MODE;
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return DEFAULT_SORT_MODE;
  }

  const result = parseSortMode(parsedJson);

  return result.success ? result.data : DEFAULT_SORT_MODE;
}

export function writeSortMode(mode: SortMode): void {
  try {
    localStorage.setItem(SORT_PREFERENCE_STORAGE_KEY, JSON.stringify(mode));
  } catch {
    // Dégradation silencieuse intentionnelle, comme le reste des modules de
    // persistance de l'app : un échec d'écriture ne doit jamais faire
    // planter le hook appelant.
  }
}
