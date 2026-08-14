"use client";

// Défense en profondeur (AD-4), en miroir de `lib/sort-preference/cache.ts` :
// ce module touche `localStorage` directement.
import { parseUntastedFilterPreference } from "../schema";

// Namespace dédié, distinct des trois autres namespaces existants
// (`crounch:tasted`, `crounch:rating`, `crounch:sort-preference`,
// `crounch:catalogue`).
export const UNTASTED_FILTER_STORAGE_KEY = "crounch:untasted-filter";

const DEFAULT_SHOW_ONLY_UNTASTED = false;

// Un stockage absent, illisible, invalide contre le schéma, ou un accès
// `localStorage` qui échoue sont tous traités comme "filtre désactivé"
// (AD-3, AC #6) — jamais un throw.
export function readUntastedFilterPreference(): boolean {
  let raw: string | null;

  try {
    raw = localStorage.getItem(UNTASTED_FILTER_STORAGE_KEY);
  } catch {
    return DEFAULT_SHOW_ONLY_UNTASTED;
  }

  if (raw === null) {
    return DEFAULT_SHOW_ONLY_UNTASTED;
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return DEFAULT_SHOW_ONLY_UNTASTED;
  }

  const result = parseUntastedFilterPreference(parsedJson);

  return result.success ? result.data : DEFAULT_SHOW_ONLY_UNTASTED;
}

export function writeUntastedFilterPreference(value: boolean): void {
  try {
    localStorage.setItem(UNTASTED_FILTER_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Dégradation silencieuse intentionnelle : un échec d'écriture ne doit
    // jamais faire planter le hook appelant.
  }
}
