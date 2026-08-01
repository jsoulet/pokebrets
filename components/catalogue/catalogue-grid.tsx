import type { Flavor } from "@/lib/schema";
import { CatalogueTile } from "./catalogue-tile";

// Grille responsive : 2-3 colonnes mobile, 4-5 tablette, 6+ desktop, largeur
// plafonnée pour éviter une grille "infinie" sur grand écran (UX-DR13, NFR1).
// Reste un composant de projection pure (Story 1.5) : ne lit ni n'écrit
// jamais `localStorage`, se contente de relayer `tastedIds`/`onToggleFlavor`
// depuis la frontière client vers chaque tuile.
type CatalogueGridProps = {
  flavors: Flavor[];
  tastedIds: ReadonlySet<Flavor["id"]>;
  onToggleFlavor: (id: Flavor["id"]) => void;
};

export function CatalogueGrid({ flavors, tastedIds, onToggleFlavor }: CatalogueGridProps) {
  return (
    <ul className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
      {flavors.map((flavor) => (
        // Clé basée sur l'id stable de la Saveur, jamais l'index (AD-1).
        <CatalogueTile
          key={flavor.id}
          flavor={flavor}
          isTasted={tastedIds.has(flavor.id)}
          onToggle={onToggleFlavor}
        />
      ))}
    </ul>
  );
}
