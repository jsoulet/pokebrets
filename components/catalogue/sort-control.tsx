import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { SortMode } from "@/lib/schema";
import { SEGMENTED_GROUP_CLASSNAME, SEGMENTED_ITEM_CLASSNAME } from "./pill-button-styles";

// Composant de présentation pur (Story 2.2), même philosophie que
// `star-rating.tsx` : ne lit/écrit jamais `localStorage`, reçoit
// `value`/`onChange` en props. Segmented control à deux options exclusives
// (`multiple={false}`, comportement par défaut de `ToggleGroup`), qui
// restitue l'état actif via `aria-pressed` sur chaque bouton (AC #5).
type SortControlProps = {
  value: SortMode;
  onChange: (mode: SortMode) => void;
};

export function SortControl({ value, onChange }: SortControlProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Libellé explicite (UX-DR14) : "Alphabétique"/"Par note" seuls ne
          disent pas à quoi ils s'appliquent hors contexte (lecteur d'écran,
          survol rapide). */}
      <span className="text-foreground text-sm font-semibold">Trier :</span>
      <ToggleGroup
        value={[value]}
        onValueChange={(values) => {
          const nextMode = values[0] as SortMode | undefined;
          if (nextMode) {
            onChange(nextMode);
          }
        }}
        aria-label="Trier le catalogue"
        spacing={0}
        className={SEGMENTED_GROUP_CLASSNAME}
      >
        <ToggleGroupItem
          value="alphabetical"
          aria-label="Trier par ordre alphabétique"
          className={SEGMENTED_ITEM_CLASSNAME}
        >
          Alphabétique
        </ToggleGroupItem>
        <ToggleGroupItem
          value="rating"
          aria-label="Trier par note"
          className={SEGMENTED_ITEM_CLASSNAME}
        >
          Par note
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
