import type { Flavor } from "@/lib/schema";

// Composant de présentation pur — chip-tile d'une Saveur du Catalogue.
// Ne lit jamais le cache/l'état goûté/pas goûté (Story 1.5) ni le détail
// (Story 1.6) : ici, uniquement le visuel et le nom (AC #1, #2).
export function CatalogueTile({ flavor }: { flavor: Flavor }) {
  return (
    <li className="bg-card border-border flex flex-col items-center gap-2 rounded-3xl border p-3 text-center">
      <img
        src={flavor.image}
        alt={flavor.name}
        className="aspect-square w-full rounded-2xl object-cover"
        loading="lazy"
      />
      <span className="text-foreground text-sm font-medium">{flavor.name}</span>
      {flavor.status === "archived" ? (
        // Badge porté par du texte, pas seulement par la couleur (a11y) —
        // le fond distinct (beige-gris, --archived) reste un renfort visuel.
        <span className="bg-archived text-foreground/80 rounded-full px-2 py-0.5 text-xs">
          Archivée
        </span>
      ) : null}
    </li>
  );
}
