"use client";

// Défense en profondeur (AD-4), en miroir de `lib/sort-preference/cache.ts` :
// ce module touche `localStorage` directement.
import { parseTastedFilterMode } from "../schema";
import type { TastedFilterMode } from "../schema";

// Namespace conservé identique à l'ancien filtre booléen (Story 2.3) —
// seul le *format* de la valeur stockée change, pas la clé : un utilisateur
// existant garde sa préférence, migrée en place (voir readTastedFilterMode).
export const TASTED_FILTER_STORAGE_KEY = "crounch:untasted-filter";

const DEFAULT_TASTED_FILTER_MODE: TastedFilterMode = "all";

// Mapping de compatibilité pour l'ancien format booléen : `true` signifiait
// "non goûtées uniquement", `false` signifiait "toutes affichées".
function migrateLegacyBooleanValue(value: unknown): TastedFilterMode | null {
  if (value === true) return "untasted";
  if (value === false) return "all";
  return null;
}

// Un stockage absent, illisible, invalide contre le schéma (et non
// convertible depuis l'ancien format booléen), ou un accès `localStorage`
// qui échoue sont tous traités comme "toutes les Saveurs" (AD-3, AC #6) —
// jamais un throw.
export function readTastedFilterMode(): TastedFilterMode {
  let raw: string | null;

  try {
    raw = localStorage.getItem(TASTED_FILTER_STORAGE_KEY);
  } catch {
    return DEFAULT_TASTED_FILTER_MODE;
  }

  if (raw === null) {
    return DEFAULT_TASTED_FILTER_MODE;
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return DEFAULT_TASTED_FILTER_MODE;
  }

  const result = parseTastedFilterMode(parsedJson);

  if (result.success) {
    return result.data;
  }

  // Rétrocompatibilité : ancienne préférence stockée sous forme booléenne.
  const legacyMode = migrateLegacyBooleanValue(parsedJson);

  if (legacyMode !== null) {
    // Réécrit immédiatement dans le nouveau format pour que la migration
    // ne s'exécute qu'une seule fois par utilisateur.
    writeTastedFilterMode(legacyMode);

    return legacyMode;
  }

  return DEFAULT_TASTED_FILTER_MODE;
}

export function writeTastedFilterMode(value: TastedFilterMode): void {
  try {
    localStorage.setItem(TASTED_FILTER_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Dégradation silencieuse intentionnelle : un échec d'écriture ne doit
    // jamais faire planter le hook appelant.
  }
}
