"use client";

// Story 2.3 (étendue) — lib/tasted-filter/ est le SEUL propriétaire de la
// préférence de filtre persistée. `'use client'` : touche `localStorage`,
// jamais évalué pendant le prerender statique (AD-4).
//
// Même pattern allégé que `lib/sort-preference/` : préférence scalaire,
// pas de map par id — pas de `stateRef` nécessaire, à l'inverse de
// `useTasted()`/`useRating()`.

import { useCallback, useState } from "react";
import { readTastedFilterMode, writeTastedFilterMode } from "./cache";
import type { TastedFilterMode } from "../schema";

export type UseTastedFilterResult = {
  filterMode: TastedFilterMode;
  setFilterMode: (value: TastedFilterMode) => void;
};

export function useTastedFilter(): UseTastedFilterResult {
  const [filterMode, setFilterModeState] = useState<TastedFilterMode>(() =>
    readTastedFilterMode(),
  );

  const setFilterMode = useCallback((value: TastedFilterMode) => {
    writeTastedFilterMode(value);
    setFilterModeState(value);
  }, []);

  return { filterMode, setFilterMode };
}
