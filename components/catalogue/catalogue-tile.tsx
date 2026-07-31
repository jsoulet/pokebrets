import type { Flavor } from "@/lib/schema";

// Composant de présentation pur — chip-tile d'une Saveur du Catalogue.
// Ne lit jamais le cache/l'état goûté/pas goûté (Story 1.5) ni le détail
// (Story 1.6) : ici, uniquement le visuel et le nom (AC #1, #2).
export function CatalogueTile({ flavor }: { flavor: Flavor }) {
  const isArchived = flavor.status === "archived";
  return (
    <li
      className={`${
        isArchived ? "bg-archived" : "bg-background"
      } flex flex-col items-center gap-2 rounded-3xl border-none p-3 text-center`}
    >
      <img
        src={flavor.image}
        alt={flavor.name}
        className="aspect-square w-full rounded-2xl object-cover"
        loading="lazy"
        onError={(event) => {
          // Repli si l'URL distante (cms.brets.fr) est cassée ou inaccessible
          // hors-ligne : un placeholder local plutôt qu'une icône d'erreur navigateur.
          event.currentTarget.onerror = null;
          event.currentTarget.src = "/placeholder-flavor.svg";
        }}
      />
      <span className="text-foreground line-clamp-2 text-sm font-medium">
        {flavor.name}
      </span>
      {isArchived ? (
        // Badge porté par du texte, pas seulement par la couleur (a11y). La
        // tuile archivée utilise déjà --archived en fond (DESIGN.md
        // chip-tile-archived) ; le badge reprend le fond neutre pour rester
        // visible par-dessus plutôt que de s'y fondre.
        <span className="bg-background text-foreground/80 rounded-full px-2 py-0.5 text-xs">
          Archivée
        </span>
      ) : null}
    </li>
  );
}
