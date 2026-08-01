"use client";

// Story 1.5 — lib/tasted/ est le SEUL propriétaire de l'État de dégustation
// dans l'app (sur le modèle d'AD-2 pour lib/catalogue/). Aucun autre module
// ne doit lire/écrire la clé `localStorage` "crounch:tasted" ni dupliquer la
// logique de toggle canonique implémentée ici.
// `'use client'` : ce module touche `localStorage`/`window`, jamais évalué
// pendant le prerender statique (AD-4).

import { useCallback, useMemo, useState } from "react";
import type { TastedState } from "../schema";
import { readTastedState, setTasted as setTastedInStorage } from "./cache";

export type UseTastedResult = {
  tastedIds: ReadonlySet<string>;
  tastedCount: number;
  isTasted: (id: string) => boolean;
  toggleTasted: (id: string) => void;
  setTasted: (id: string, next: boolean) => void;
};

export function useTasted(): UseTastedResult {
  // Hydratation en initialiseur paresseux (pas dans un effect) : reste
  // compatible avec `output: "export"` et ne touche jamais `window` pendant
  // le prerender statique (même pattern que `useCatalogue()`, Story 1.3).
  const [state, setState] = useState<TastedState>(() => readTastedState());

  const tastedIds = useMemo(() => new Set(Object.keys(state)), [state]);
  const tastedCount = tastedIds.size;

  const isTasted = useCallback((id: string) => state[id] === true, [state]);

  // Mutation canonique unique (AC #3, AD-8) : délègue toujours à
  // `setTasted()` de `lib/tasted/cache.ts`, qui relit l'état persistant le
  // plus récent juste avant d'écrire — jamais un read-modify-write basé sur
  // un snapshot React potentiellement périmé (deux toggles rapprochés, deux
  // onglets).
  const applyTasted = useCallback((id: string, next: boolean) => {
    const nextState = setTastedInStorage(id, next);
    setState(nextState);
  }, []);

  const toggleTasted = useCallback(
    (id: string) => {
      applyTasted(id, state[id] !== true);
    },
    [applyTasted, state],
  );

  const setTasted = useCallback(
    (id: string, next: boolean) => {
      applyTasted(id, next);
    },
    [applyTasted],
  );

  return { tastedIds, tastedCount, isTasted, toggleTasted, setTasted };
}
