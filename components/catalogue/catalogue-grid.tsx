import type { Flavor } from "@/lib/schema";
import { CatalogueTile } from "./catalogue-tile";

// Grille responsive : 2-3 colonnes mobile, 4 colonnes tablette/desktop
// (jamais plus, décision produit explicite — prime sur EXPERIENCE.md >
// Responsive & Platform qui suggérait "6+" en desktop), largeur plafonnée
// pour éviter une grille "infinie" sur grand écran (UX-DR13, NFR1). Reste un
// composant de projection pure (Story 1.5/1.6) : ne lit ni n'écrit jamais
// `localStorage`, se contente de relayer `tastedIds`/`onToggleFlavor` et
// `onOpenFlavorDetail` depuis la frontière client vers chaque tuile. Ne
// possède aucun état d'ouverture de détail (Story 1.6) : ce dernier reste
// centralisé dans `catalogue-page-client.tsx` pour rester une Dialog unique
// contrôlée.
type CatalogueGridProps = {
  flavors: Flavor[];
  tastedIds: ReadonlySet<Flavor["id"]>;
  getRating: (id: Flavor["id"]) => number | undefined;
  onToggleFlavor: (id: Flavor["id"]) => void;
  onOpenFlavorDetail: (id: Flavor["id"], triggerElement: HTMLButtonElement) => void;
};

export function CatalogueGrid({
  flavors,
  tastedIds,
  getRating,
  onToggleFlavor,
  onOpenFlavorDetail,
}: CatalogueGridProps) {
  return (
    <ul className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:gap-6 sm:p-6 lg:grid-cols-4 lg:gap-12 lg:p-8">
      {flavors.map((flavor) => (
        // Clé basée sur l'id stable de la Saveur, jamais l'index (AD-1).
        <CatalogueTile
          key={flavor.id}
          flavor={flavor}
          isTasted={tastedIds.has(flavor.id)}
          rating={getRating(flavor.id)}
          onToggle={onToggleFlavor}
          onOpenDetail={onOpenFlavorDetail}
        />
      ))}
    </ul>
  );
}
