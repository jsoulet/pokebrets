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
  rating: number | undefined;
  onToggle: (id: Flavor["id"]) => void;
  onOpenDetail: (id: Flavor["id"], triggerElement: HTMLButtonElement) => void;
};

export function CatalogueTile({
  flavor,
  isTasted,
  rating,
  onToggle,
  onOpenDetail,
}: CatalogueTileProps) {
  const isArchived = flavor.status === "archived";
  return (
    <li
      className={`${isArchived ? "bg-archived" : "bg-background"} relative aspect-square rounded-2xl border-none transition-all hover:-translate-y-1 hover:shadow-[0_0_16px_rgba(0,0,0,0.18)]`}
    >
      <button
        type="button"
        aria-pressed={isTasted}
        // [Review] Story 1.7 code review : nom accessible explicite plutôt
        // que laissé au calcul par défaut (concaténation de l'alt de
        // l'image + du nom + du badge archivé descendant). Sans cet
        // `aria-label`, la phrase complète du badge archivé ("Cette saveur
        // n'est plus produite") se serait retrouvée absorbée dans le nom
        // du bouton à chaque interaction. Le badge reste un `<span>`
        // descendant normal (pas `aria-hidden`), donc toujours perceptible
        // par un lecteur d'écran en lecture linéaire (UX-DR14), juste plus
        // "annoncé au clic sur le bouton".
        aria-label={flavor.name}
        onClick={() => onToggle(flavor.id)}
        className="flex h-full w-full flex-col items-center gap-1 rounded-2xl p-2 text-center"
      >
        {/* DESIGN.md > chip-tile : la tuile entière reste un carré parfait
            (façon bingo/pokédex, cf. EXPERIENCE.md), pas seulement l'image
            — le nom occupe une bande fixe en bas plutôt que de s'ajouter
            sous un carré, sans quoi la tuile devient un rectangle. */}
        <img
          src={flavor.image}
          alt={flavor.name}
          className="min-h-0 w-full flex-1 rounded-xl object-cover"
          loading="lazy"
          onError={handleFlavorImageError}
        />
        <span className="text-foreground font-recoleta line-clamp-2 shrink-0 text-[20px] leading-tight font-semibold">
          {flavor.name}
        </span>
        {isArchived ? (
          // Badge archivée porté par du texte, pas seulement par la couleur (a11y).
          // La tuile archivée utilise déjà --archived en fond (DESIGN.md
          // chip-tile-archived) ; le badge reprend le fond neutre pour rester
          // visible par-dessus plutôt que de s'y fondre.
          <span className="bg-background text-foreground/80 shrink-0 rounded-full px-2 py-0.5 text-xs">
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
        className="border-foreground text-foreground absolute top-2 left-2 size-9 rounded-full border-2 bg-background shadow-[2px_2px_0px_var(--foreground)] transition-transform hover:-translate-y-0.5 hover:bg-background active:translate-y-0.5 active:shadow-[1px_1px_0px_var(--foreground)]"
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
          className="border-foreground text-foreground pointer-events-none absolute top-2 right-2 rounded-full border-2 bg-[#8fbf98] px-2 py-0.5 font-tanker text-xs tracking-wide uppercase shadow-[2px_2px_0px_var(--foreground)]"
        >
          Goûtée
        </span>
      ) : null}
      {rating !== undefined ? (
        // Badge notation (`badge-rating`, DESIGN.md) — coin bas-droit,
        // seul coin encore libre : info en haut-gauche, badge "Goûtée" en
        // haut-droit (Story 2.1, AC #3). N'apparaît jamais à "0" ou vide
        // (AC #4) — rendu conditionné à `rating !== undefined`.
        // `pointer-events-none`, décoratif, porté par du texte (a11y),
        // même traitement que le badge "Goûtée".
        <span
          aria-hidden="true"
          className="bg-primary text-primary-foreground pointer-events-none absolute right-2 bottom-2 rounded-full px-2 py-0.5 text-xs"
        >
          ★ {rating}
        </span>
      ) : null}
    </li>
  );
}
