"use client";

// Story 2.2 — lib/sort-preference/ est le SEUL propriétaire de la
// préférence de tri persistée. `'use client'` : touche `localStorage`,
// jamais évalué pendant le prerender statique (AD-4).
//
// Plus simple que `useTasted()`/`useRating()` : la préférence de tri est un
// scalaire (pas une map par id de saveur), donc pas besoin d'un `stateRef`
// de protection contre les doubles-mutations rapprochées — un seul
// utilisateur ne choisit qu'un mode à la fois, contrairement au toggle
// par-saveur qui peut recevoir deux appels rapides sur des ids différents.

import { useCallback, useState } from "react";
import type { SortMode } from "../schema";
import { readSortMode, writeSortMode } from "./cache";

export type UseSortPreferenceResult = {
  sortMode: SortMode;
  setSortMode: (mode: SortMode) => void;
};

export function useSortPreference(): UseSortPreferenceResult {
  const [sortMode, setSortModeState] = useState<SortMode>(() => readSortMode());

  const setSortMode = useCallback((mode: SortMode) => {
    writeSortMode(mode);
    setSortModeState(mode);
  }, []);

  return { sortMode, setSortMode };
}
