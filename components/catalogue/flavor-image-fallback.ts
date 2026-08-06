import type { ReactEventHandler } from "react";

// [Review] Repli d'image partagé (tuile + Dialog de détail) : si l'URL
// distante (cms.brets.fr) est cassée ou inaccessible hors-ligne, bascule sur
// un placeholder local plutôt que l'icône d'erreur par défaut du navigateur.
// Extrait pour éviter la duplication verbatim introduite par Story 1.6.
export const handleFlavorImageError: ReactEventHandler<HTMLImageElement> = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = "/placeholder-flavor.svg";
};
