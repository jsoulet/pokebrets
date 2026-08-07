"use client";

// Story 1.3 — lib/catalogue/ est le SEUL propriétaire de la fraîcheur du
// Catalogue dans l'app (AD-2). Aucun autre module ne doit lire/écrire
// `localStorage` ou fetcher `CATALOGUE_URL` directement, ni dupliquer la
// logique de comparaison de révision (`generatedAt`) implémentée ici.
// `'use client'` : ce module touche `localStorage`/`window`, jamais évalué
// pendant le prerender statique (AD-4, AC #7).

import { useCallback, useEffect, useRef, useState } from "react";
import type { Catalogue } from "../schema";
import { readCache, writeCache } from "./cache";
import { fetchCatalogue } from "./fetch";

export type CatalogueStatus = "loading" | "ready" | "error";

export type UseCatalogueResult = {
  data: Catalogue | null;
  status: CatalogueStatus;
  error: string | null;
  retry: () => void;
  // Story 1.7 (AC #1, UX-DR12) : vrai uniquement quand une révision de
  // Catalogue est déjà détenue ET que le dernier rafraîchissement en
  // arrière-plan a échoué (network, non-2xx ou JSON invalide — cf. AD-3,
  // les trois causes sont traitées identiquement). Ne diagnostique jamais
  // `navigator.onLine` : reflète seulement "la dernière synchronisation a
  // échoué, le Catalogue affiché peut être périmé". Jamais vrai tant
  // qu'aucun cache n'existe (dans ce cas `status === "error"` s'applique).
  isOffline: boolean;
};

const ERROR_MESSAGE = "Impossible de charger le catalogue pour l'instant. Réessaie avec une connexion.";

export function useCatalogue(): UseCatalogueResult {
  // Subtask 4.1/4.2: le cache est lu une seule fois, en initialiseur paresseux
  // (pas dans un effect) — évite un setState synchrone en effet (cascading
  // renders) tout en gardant le montage "cache-first" au tout premier rendu.
  const [data, setData] = useState<Catalogue | null>(() => readCache());
  const [status, setStatus] = useState<CatalogueStatus>(() => (data !== null ? "ready" : "loading"));
  const [error, setError] = useState<string | null>(null);
  // Story 1.7 (AC #1) : signal de lecture pur, dérivé exclusivement à
  // l'intérieur de ce hook (AD-2) — jamais recalculé ailleurs.
  const [isOffline, setIsOffline] = useState(false);

  // Révision actuellement détenue (cache ou dernière réponse appliquée) —
  // sert de référence pour la comparaison monotone (Subtask 4.3/4.4, AC #4).
  // Un ref (pas un state) car cette valeur ne doit jamais déclencher de
  // re-render à elle seule, seulement guider la logique d'application.
  const currentRevisionRef = useRef<string | null>(data?.generatedAt ?? null);

  // [Review] Garde anti-setState-après-démontage : la promesse de
  // `fetchCatalogue()` peut résoudre après que le composant appelant se
  // soit démonté (navigation, changement de vue) — sans cette garde, le
  // hook mettrait à jour un state orphelin.
  const isMountedRef = useRef(true);

  const revalidate = useCallback(() => {
    void fetchCatalogue().then((result) => {
      if (!isMountedRef.current) {
        return;
      }

      if (!result.success) {
        // Subtask 4.4: un cache/donnée existait déjà -> échec silencieux,
        // le cache reste affiché intact. Aucune donnée n'existait -> error.
        setStatus((prevStatus) => (prevStatus === "loading" ? "error" : prevStatus));
        setError((prevError) => (currentRevisionRef.current === null ? ERROR_MESSAGE : prevError));
        // Story 1.7 (AC #1) : un cache existant + échec de rafraîchissement
        // en arrière-plan est précisément le cas "hors ligne" à signaler à
        // l'UI — jamais vrai quand aucune révision n'est encore détenue
        // (ce cas relève de `status === "error"`, AC #2).
        setIsOffline(currentRevisionRef.current !== null);
        return;
      }

      // [Review] Subtask 4.3/4.5/AC #4 : comparaison par timestamp réel
      // (Date.parse), pas par ordre lexicographique de string — `z.iso.datetime()`
      // accepte plusieurs sérialisations valides du même instant (avec/sans
      // millisecondes, offset explicite ou "Z"), une comparaison de strings
      // brutes pourrait inverser l'ordre de fraîcheur pour deux réponses
      // représentant pourtant le même instant ou un instant plus ancien.
      // N'appliquer que si strictement plus récent (ou si aucune révision
      // n'est encore détenue) — une réponse plus ancienne ou égale est
      // silencieusement ignorée, la fraîcheur ne recule jamais.
      if (
        currentRevisionRef.current !== null &&
        Date.parse(result.data.generatedAt) <= Date.parse(currentRevisionRef.current)
      ) {
        // [Review] Le réseau a bel et bien répondu ici (juste avec une
        // révision non plus récente, silencieusement ignorée ci-dessus) —
        // ce n'est plus "hors ligne", même si aucune nouvelle donnée n'est
        // appliquée. Sans ce reset, `isOffline` resterait bloqué à `true`
        // après un précédent échec de fond, jusqu'à la prochaine réponse
        // strictement plus récente.
        setIsOffline(false);
        return;
      }

      currentRevisionRef.current = result.data.generatedAt;
      writeCache(result.data);
      setData(result.data);
      setStatus("ready");
      setError(null);
      setIsOffline(false);
    });
  }, []);

  useEffect(() => {
    // L'état initial (cache ou "loading") est déjà posé par les
    // initialiseurs paresseux ci-dessus — l'effet ne fait que déclencher
    // le fetch réseau en arrière-plan (Subtask 4.1/4.2).
    isMountedRef.current = true;
    revalidate();

    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retry = useCallback(() => {
    revalidate();
  }, [revalidate]);

  return { data, status, error, isOffline, retry };
}

