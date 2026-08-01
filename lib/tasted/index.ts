"use client";

// Story 1.5 — lib/tasted/ est le SEUL propriétaire de l'État de dégustation
// dans l'app (sur le modèle d'AD-2 pour lib/catalogue/). Aucun autre module
// ne doit lire/écrire la clé `localStorage` "crounch:tasted" ni dupliquer la
// logique de toggle canonique implémentée ici.
// `'use client'` : ce module touche `localStorage`/`window`, jamais évalué
// pendant le prerender statique (AD-4).

import { useCallback, useMemo, useRef, useState } from "react";
import type { TastedState } from "../schema";
import { readTastedState, setTasted as setTastedInStorage } from "./cache";

export type UseTastedResult = {
  tastedIds: ReadonlySet<string>;
  tastedCount: number;
  isTasted: (id: string) => boolean;
  // Retourne le nouvel état goûté/pas goûté résultant (synchrone), pour que
  // les appelants (ex: l'annonce lecteur d'écran de catalogue-page-client)
  // n'aient jamais à re-dériver ce résultat depuis un état React
  // potentiellement périmé (voir stateRef ci-dessous, [Review] AC #3/AD-8).
  toggleTasted: (id: string) => boolean;
  setTasted: (id: string, next: boolean) => void;
};

export function useTasted(): UseTastedResult {
  // Hydratation en initialiseur paresseux (pas dans un effect) : reste
  // compatible avec `output: "export"` et ne touche jamais `window` pendant
  // le prerender statique (même pattern que `useCatalogue()`, Story 1.3).
  const [state, setState] = useState<TastedState>(() => readTastedState());

  // [Review] `stateRef` est la source de vérité synchrone pour toute
  // décision de mutation (toggle), mise à jour immédiatement à chaque appel
  // de `applyTasted` — jamais seulement via `state` (React). `state`
  // provenant d'un `useState` n'est garanti à jour qu'après un nouveau
  // rendu : deux appels de `toggleTasted()` survenant avant que React n'ait
  // eu l'occasion de re-render (double-tap rapide, gestionnaire appelé deux
  // fois dans le même tick) liraient sinon la même valeur "state" périmée
  // et pousseraient toutes les deux le même booléen au lieu d'alterner —
  // bug reproduit et corrigé suite à la revue de code de cette story.
  const stateRef = useRef<TastedState>(state);

  const tastedIds = useMemo(
    // Ne dérive que des clés valant strictement `true` : le schéma partagé
    // (AD-7) autorise techniquement `false` en valeur, mais le contrat de
    // persistance de ce module est une map sparse (clé absente = pas
    // goûté). Filtrer ici protège contre toute donnée `false` explicite qui
    // aurait pu être écrite hors du chemin canonique (migration, édition
    // manuelle du storage, etc.), pour ne jamais désynchroniser `tastedIds`
    // et `isTasted()`.
    () => new Set(Object.entries(state).filter(([, value]) => value === true).map(([id]) => id)),
    [state],
  );
  const tastedCount = tastedIds.size;

  const isTasted = useCallback((id: string) => state[id] === true, [state]);

  // Mutation canonique unique (AC #3, AD-8) : délègue toujours à
  // `setTasted()` de `lib/tasted/cache.ts`, qui relit l'état persistant le
  // plus récent juste avant d'écrire — jamais un read-modify-write basé sur
  // un snapshot React potentiellement périmé (deux toggles rapprochés, deux
  // onglets).
  const applyTasted = useCallback((id: string, next: boolean) => {
    const nextState = setTastedInStorage(id, next);
    stateRef.current = nextState;
    setState(nextState);
  }, []);

  const toggleTasted = useCallback(
    (id: string) => {
      // Lit `stateRef.current` (toujours à jour de manière synchrone),
      // jamais `state` capturé par la fermeture du rendu courant.
      const next = stateRef.current[id] !== true;
      applyTasted(id, next);
      return next;
    },
    [applyTasted],
  );

  const setTasted = useCallback(
    (id: string, next: boolean) => {
      applyTasted(id, next);
    },
    [applyTasted],
  );

  return { tastedIds, tastedCount, isTasted, toggleTasted, setTasted };
}
