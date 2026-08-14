import { Toggle } from "@/components/ui/toggle";
import { PILL_BUTTON_CLASSNAME } from "./pill-button-styles";

// Composant de présentation pur (Story 2.3), même philosophie que
// `sort-control.tsx`/`star-rating.tsx` : ne lit/écrit jamais `localStorage`,
// reçoit `checked`/`onCheckedChange` en props. Reconstruit sur `Toggle`
// (bouton pilule) plutôt que `Switch` pour partager la même DA que
// `SortControl` — les deux contrôles de la toolbar restent visuellement de
// la même famille (bouton jaune/contour noir de brets.fr) plutôt qu'un
// mélange switch + pilules. Le libellé texte reste toujours visible dans le
// bouton (jamais une icône seule, UX-DR14).
type UntastedFilterToggleProps = {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
};

export function UntastedFilterToggle({ checked, onCheckedChange }: UntastedFilterToggleProps) {
  return (
    <Toggle
      pressed={checked}
      onPressedChange={(value) => onCheckedChange(value)}
      aria-label="Non goûtées uniquement"
      className={PILL_BUTTON_CLASSNAME}
    >
      Non goûtées uniquement
    </Toggle>
  );
}
