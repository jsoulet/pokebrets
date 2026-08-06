"use client";

import { useRef, useState } from "react";
import { useCatalogue } from "@/lib/catalogue";
import { useTasted } from "@/lib/tasted";
import { Button } from "@/components/ui/button";
import { CatalogueGrid } from "./catalogue-grid";
import { CatalogueGridSkeleton } from "./catalogue-grid-skeleton";
import { FlavorDetailDialog } from "./flavor-detail-dialog";

// Frontière Client Component (AD-4) : ce composant est le seul consommateur
// de `useCatalogue()` (Story 1.3) et `useTasted()` (Story 1.5) de la page
// d'accueil. Il ne fait que composer/projeter leurs deux contrats — jamais de
// fetch, de lecture de localStorage, ni de comparaison de fraîcheur ici
// (lib/catalogue/ et lib/tasted/ restent les seuls propriétaires de leur état
// respectif). Story 1.6 : reste aussi le seul coordinateur de l'ouverture du
// détail de Saveur (une Dialog unique contrôlée), pour ne pas disperser
// l'état d'ouverture dans chaque tuile et pour garder l'annonce `aria-live`
// et la mutation goûté/pas goûté centralisées en un seul endroit.
export function CataloguePageClient() {
  const { data, status, error, retry } = useCatalogue();
  const { tastedIds, toggleTasted } = useTasted();

  // Annonce lecteur d'écran du changement d'état (AC #5, UX-DR14) : une
  // région `aria-live="polite"` distincte plutôt que de faire reposer toute
  // l'accessibilité sur `aria-pressed` seul. `catalogue-tile.tsx` reste ainsi
  // purement présentational et ignore tout de l'annonce.
  const [announcement, setAnnouncement] = useState("");

  // Story 1.6 : id de la Saveur dont le détail est ouvert (ou `null`) — seule
  // source de vérité pour une Dialog unique contrôlée, jamais un état
  // d'ouverture par tuile (AD-1 : jointure par `flavor.id`).
  const [selectedFlavorId, setSelectedFlavorId] = useState<string | null>(null);
  // Bouton info ayant ouvert la Dialog, pour lui rendre le focus à la
  // fermeture (Subtask 4.4), quelle que soit la cause de fermeture (Échap,
  // clic extérieur, bouton de fermeture explicite).
  const detailTriggerRef = useRef<HTMLButtonElement | null>(null);

  if (status === "loading") {
    return <CatalogueGridSkeleton />;
  }

  if (status === "error") {
    return (
      <div role="alert" className="flex flex-col items-center gap-3 p-8 text-center">
        <p className="text-foreground">{error}</p>
        <Button onClick={retry}>Réessayer</Button>
      </div>
    );
  }

  // status === "ready" : data est garanti non-null par le contrat du hook
  // (Story 1.3) une fois "ready" atteint, que l'origine soit le cache local
  // ou une réponse réseau fraîche — la UI n'a jamais à distinguer les deux.
  const flavors = data?.flavors ?? [];

  // Compteur de progression (AC #4, UX-DR10) : `X` dérivé par jointure sur les
  // `flavor.id` du Catalogue courant, jamais par un compte déconnecté du
  // Catalogue (AD-1) — protège contre d'éventuelles clés orphelines dans
  // l'état persisté sans jamais le purger automatiquement.
  const tastedInCatalogueCount = flavors.filter((flavor) => tastedIds.has(flavor.id)).length;
  const selectedFlavor = flavors.find((flavor) => flavor.id === selectedFlavorId) ?? null;

  function handleToggleFlavor(id: string) {
    const flavor = flavors.find((candidate) => candidate.id === id);
    const nextIsTasted = toggleTasted(id);

    if (flavor) {
      setAnnouncement(`${flavor.name}, ${nextIsTasted ? "goûtée" : "pas goûtée"}`);
    }
  }

  function handleOpenFlavorDetail(id: string, triggerElement: HTMLButtonElement) {
    detailTriggerRef.current = triggerElement;
    setSelectedFlavorId(id);
  }

  function handleDetailOpenChange(open: boolean) {
    // Ouvrir/fermer la Dialog (Échap, clic extérieur, bouton de fermeture)
    // ne mute jamais l'état goûté/pas goûté : seul `handleToggleFlavor`,
    // appelé explicitement par le bouton toggle de la Dialog, le fait.
    if (!open) {
      setSelectedFlavorId(null);
    }
  }

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <p className="text-foreground text-sm font-medium">
        {tastedInCatalogueCount}/{flavors.length} saveurs goûtées
      </p>
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
      <CatalogueGrid
        flavors={flavors}
        tastedIds={tastedIds}
        onToggleFlavor={handleToggleFlavor}
        onOpenFlavorDetail={handleOpenFlavorDetail}
      />
      {selectedFlavor ? (
        <FlavorDetailDialog
          flavor={selectedFlavor}
          open={selectedFlavorId !== null}
          onOpenChange={handleDetailOpenChange}
          isTasted={tastedIds.has(selectedFlavor.id)}
          onToggle={handleToggleFlavor}
          finalFocusRef={detailTriggerRef}
        />
      ) : null}
    </div>
  );
}
