import { InfoIcon } from "lucide-react";
import type { Flavor } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { handleFlavorImageError } from "./flavor-image-fallback";

// Composant de présentation pur — chip-tile d'une Saveur du Catalogue.
// Ne lit ni n'écrit jamais `localStorage` lui-même (Story 1.5) : l'état
// goûté/pas goûté et la mutation lui sont fournis en props par la frontière
// client (`catalogue-page-client.tsx`), afin que la tuile reste réutilisable
// et testable sans dépendre de `lib/tasted/` (AD-2/AD-4).
// Story 1.6 : la tuile porte désormais DEUX actions interactives sœurs, un
// <button> ne pouvant jamais légalement en contenir un autre. Le bouton
// principal (toggle goûté/pas goûté) occupe toute la tuile ; un second petit
// bouton "info" (icône dédiée, jamais imbriqué) ouvre le détail de la Saveur
// sans jamais déclencher le toggle. Le bouton info est positionné en coin
// opposé au badge "Goûtée" (top-left vs top-right) pour éviter tout conflit
// visuel.
type CatalogueTileProps = {
  flavor: Flavor;
  isTasted: boolean;
  onToggle: (id: Flavor["id"]) => void;
  onOpenDetail: (id: Flavor["id"], triggerElement: HTMLButtonElement) => void;
};

export function CatalogueTile({ flavor, isTasted, onToggle, onOpenDetail }: CatalogueTileProps) {
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
          onError={handleFlavorImageError}
        />
        <span className="text-foreground line-clamp-2 text-sm font-medium">{flavor.name}</span>
        {isArchived ? (
          // Badge archivée porté par du texte, pas seulement par la couleur (a11y).
          // La tuile archivée utilise déjà --archived en fond (DESIGN.md
          // chip-tile-archived) ; le badge reprend le fond neutre pour rester
          // visible par-dessus plutôt que de s'y fondre.
          <span className="bg-background text-foreground/80 rounded-full px-2 py-0.5 text-xs">
            Cette saveur n&apos;est plus produite
          </span>
        ) : null}
      </button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Voir le détail de ${flavor.name}`}
        onClick={(event) => onOpenDetail(flavor.id, event.currentTarget)}
        className="bg-background/90 text-foreground/80 hover:text-foreground hover:bg-background/90 absolute top-2 left-2 size-11 rounded-full"
      >
        <InfoIcon aria-hidden="true" className="size-4" />
      </Button>
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
