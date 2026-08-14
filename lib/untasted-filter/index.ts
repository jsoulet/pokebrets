"use client";

// Story 2.3 — lib/untasted-filter/ est le SEUL propriétaire de la
// préférence de filtre persistée. `'use client'` : touche `localStorage`,
// jamais évalué pendant le prerender statique (AD-4).
//
// Même pattern allégé que `lib/sort-preference/` : préférence scalaire
// booléenne, pas de map par id — pas de `stateRef` nécessaire, à l'inverse
// de `useTasted()`/`useRating()`.

import { useCallback, useState } from "react";
import { readUntastedFilterPreference, writeUntastedFilterPreference } from "./cache";

export type UseUntastedFilterResult = {
  showOnlyUntasted: boolean;
  setShowOnlyUntasted: (value: boolean) => void;
};

export function useUntastedFilter(): UseUntastedFilterResult {
  const [showOnlyUntasted, setShowOnlyUntastedState] = useState<boolean>(() =>
    readUntastedFilterPreference(),
  );

  const setShowOnlyUntasted = useCallback((value: boolean) => {
    writeUntastedFilterPreference(value);
    setShowOnlyUntastedState(value);
  }, []);

  return { showOnlyUntasted, setShowOnlyUntasted };
}
