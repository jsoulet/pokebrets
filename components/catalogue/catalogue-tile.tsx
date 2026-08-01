import type { Flavor } from "@/lib/schema";

// Composant de présentation pur — chip-tile d'une Saveur du Catalogue.
// Ne lit ni n'écrit jamais `localStorage` lui-même (Story 1.5) : l'état
// goûté/pas goûté et la mutation lui sont fournis en props par la frontière
// client (`catalogue-page-client.tsx`), afin que la tuile reste réutilisable
// et testable sans dépendre de `lib/tasted/` (AD-2/AD-4).
// Ne porte pas encore l'action "détail" (Story 1.6) : le bouton de toggle
// occupe toute la tuile pour l'instant, une future action frère distincte
// (ex: icône info) pourra être ajoutée à côté sans imbrication de <button>.
type CatalogueTileProps = {
  flavor: Flavor;
  isTasted: boolean;
  onToggle: (id: Flavor["id"]) => void;
};

export function CatalogueTile({ flavor, isTasted, onToggle }: CatalogueTileProps) {
  const isArchived = flavor.status === "archived";
  return (
    <li
      className={`${isArchived ? "bg-archived" : "bg-background"} relative rounded-3xl border-none`}
    >
      <button
        type="button"
        aria-pressed={isTasted}
        onClick={() => onToggle(flavor.id)}
        className="flex w-full flex-col items-center gap-2 rounded-3xl p-3 text-center"
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
        <span className="text-foreground line-clamp-2 text-sm font-medium">{flavor.name}</span>
        {isArchived ? (
          // Badge archivée porté par du texte, pas seulement par la couleur (a11y).
          // La tuile archivée utilise déjà --archived en fond (DESIGN.md
          // chip-tile-archived) ; le badge reprend le fond neutre pour rester
          // visible par-dessus plutôt que de s'y fondre.
          <span className="bg-background text-foreground/80 rounded-full px-2 py-0.5 text-xs">
            Archivée
          </span>
        ) : null}
      </button>
      {isTasted ? (
        // [Review] Badge goûtée (`badge-tasted`, DESIGN.md) posé "en coin de
        // la tuile" (AC #1) — positionné en dehors du `<button>` (décoratif,
        // `pointer-events-none`) pour ne pas intercepter le tap et ne pas
        // dupliquer l'annonce déjà portée par `aria-pressed` +
        // l'`aria-live` du composant client. Fond distinct porté par du
        // texte, pas seulement par la couleur ; le fond de la tuile reste
        // neutre, jamais de remplissage plein vert (anti-pattern "feu
        // tricolore" explicitement rejeté par DESIGN.md).
        <span
          aria-hidden="true"
          className="bg-success text-success-foreground pointer-events-none absolute top-2 right-2 rounded-full px-2 py-0.5 text-xs"
        >
          Goûtée
        </span>
      ) : null}
    </li>
  );
}
