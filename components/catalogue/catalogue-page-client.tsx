"use client";

import { useCatalogue } from "@/lib/catalogue";
import { Button } from "@/components/ui/button";
import { CatalogueGrid } from "./catalogue-grid";
import { CatalogueGridSkeleton } from "./catalogue-grid-skeleton";

// Frontière Client Component (AD-4) : ce composant est le seul consommateur
// de `useCatalogue()` de la page d'accueil. Il ne fait que projeter
// `{ data, status, error, retry }` — jamais de fetch, de lecture de
// localStorage, ni de comparaison de fraîcheur ici (Story 1.3 reste l'unique
// propriétaire de la fraîcheur du Catalogue, AD-2).
export function CataloguePageClient() {
  const { data, status, error, retry } = useCatalogue();

  if (status === "loading") {
    return <CatalogueGridSkeleton />;
  }

  if (status === "error") {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 p-8 text-center"
      >
        <p className="text-foreground">{error}</p>
        <Button onClick={retry}>Réessayer</Button>
      </div>
    );
  }

  // status === "ready" : data est garanti non-null par le contrat du hook
  // (Story 1.3) une fois "ready" atteint, que l'origine soit le cache local
  // ou une réponse réseau fraîche — la UI n'a jamais à distinguer les deux.
  return <CatalogueGrid flavors={data?.flavors ?? []} />;
}
