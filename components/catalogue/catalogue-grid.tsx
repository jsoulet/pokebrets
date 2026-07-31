import type { Flavor } from "@/lib/schema";
import { CatalogueTile } from "./catalogue-tile";

// Grille responsive : 2-3 colonnes mobile, 4-5 tablette, 6+ desktop, largeur
// plafonnée pour éviter une grille "infinie" sur grand écran (UX-DR13, NFR1).
export function CatalogueGrid({ flavors }: { flavors: Flavor[] }) {
  return (
    <ul className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
      {flavors.map((flavor) => (
        // Clé basée sur l'id stable de la Saveur, jamais l'index (AD-1).
        <CatalogueTile key={flavor.id} flavor={flavor} />
      ))}
    </ul>
  );
}
