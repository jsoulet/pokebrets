import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { TastedFilterMode } from "@/lib/schema";
import { SEGMENTED_GROUP_CLASSNAME, SEGMENTED_ITEM_CLASSNAME } from "./pill-button-styles";

// Composant de présentation pur (Story 2.3, étendue), même philosophie que
// `sort-control.tsx`/`star-rating.tsx` : ne lit/écrit jamais `localStorage`,
// reçoit `value`/`onChange` en props. Segmented control à 3 options
// exclusives ("Toutes"/"Goûtées"/"Non goûtées", `multiple={false}`,
// comportement par défaut de `ToggleGroup`) plutôt qu'un simple booléen
// "non goûtées uniquement" + un second bouton séparé — un seul contrôle
// segmenté reste plus léger visuellement (retour utilisateur : "évite les
// design lourdingues") tout en couvrant les deux besoins.
type TastedFilterControlProps = {
  value: TastedFilterMode;
  onChange: (mode: TastedFilterMode) => void;
};

export function TastedFilterControl({ value, onChange }: TastedFilterControlProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Libellé explicite (UX-DR14), même pattern que `SortControl`. */}
      <span className="text-foreground text-sm font-semibold">Filtrer :</span>
      <ToggleGroup
        value={[value]}
        onValueChange={(values) => {
          const nextMode = values[0] as TastedFilterMode | undefined;
          if (nextMode) {
            onChange(nextMode);
          }
        }}
        aria-label="Filtrer les Saveurs selon leur statut goûté"
        spacing={0}
        className={SEGMENTED_GROUP_CLASSNAME}
      >
        <ToggleGroupItem value="all" aria-label="Afficher toutes les Saveurs" className={SEGMENTED_ITEM_CLASSNAME}>
          Toutes
        </ToggleGroupItem>
        <ToggleGroupItem
          value="tasted"
          aria-label="Afficher uniquement les Saveurs goûtées"
          className={SEGMENTED_ITEM_CLASSNAME}
        >
          Goûtées
        </ToggleGroupItem>
        <ToggleGroupItem
          value="untasted"
          aria-label="Afficher uniquement les Saveurs non goûtées"
          className={SEGMENTED_ITEM_CLASSNAME}
        >
          Non goûtées
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
