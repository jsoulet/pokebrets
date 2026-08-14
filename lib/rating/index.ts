"use client";

// Story 2.1 — lib/rating/ est le SEUL propriétaire de l'État de notation
// dans l'app (même frontière qu'AD-2 pour lib/tasted/). Aucun autre module
// ne doit lire/écrire la clé `localStorage` "crounch:rating" ni dupliquer la
// logique de mutation canonique implémentée ici.
// `'use client'` : ce module touche `localStorage`, jamais évalué pendant le
// prerender statique (AD-4).

import { useCallback, useRef, useState } from "react";
import type { RatingState } from "../schema";
import { readRatingState, setRating as setRatingInStorage } from "./cache";

export type UseRatingResult = {
  getRating: (id: string) => number | undefined;
  setRating: (id: string, value: number | null) => void;
};

export function useRating(): UseRatingResult {
  // Hydratation en initialiseur paresseux (pas dans un effect) : reste
  // compatible avec `output: "export"` et ne touche jamais `window` pendant
  // le prerender statique (même pattern que `useTasted()`, Story 1.3/1.5).
  const [state, setState] = useState<RatingState>(() => readRatingState());

  // [Review pattern] Même protection que `useTasted()` : `stateRef` reste la
  // source de vérité synchrone pour toute décision de mutation, mise à jour
  // immédiatement — jamais seulement `state` (React), qui n'est garanti à
  // jour qu'après un nouveau rendu.
  const stateRef = useRef<RatingState>(state);

  const getRating = useCallback(
    (id: string): number | undefined => state[id],
    [state],
  );

  // Mutation canonique unique (AD-8) : délègue toujours à `setRating()` de
  // `lib/rating/cache.ts`, qui relit l'état persistant le plus récent juste
  // avant d'écrire.
  const setRating = useCallback((id: string, value: number | null) => {
    const nextState = setRatingInStorage(id, value);
    stateRef.current = nextState;
    setState(nextState);
  }, []);

  return { getRating, setRating };
}
