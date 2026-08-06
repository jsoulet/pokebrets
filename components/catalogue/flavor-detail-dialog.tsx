import type { Flavor } from "@/lib/schema";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

// Composant de domaine (Story 1.6) : rend le détail agrandi d'une Saveur
// dans une Dialog contrôlée. Ne possède JAMAIS son propre état "goûté/pas
// goûté" — reçoit `isTasted` en prop et délègue toute mutation à `onToggle`,
// qui doit être la même fonction de coordination (`handleToggleFlavor`) que
// celle utilisée par la tuile, afin de rester synchrone avec le badge, le
// compteur et l'annonce lecteur d'écran déjà en place depuis Story 1.5
// (AD-8, pas de second store).
// L'ouverture/fermeture (Échap, clic extérieur, bouton de fermeture) ne
// déclenche jamais `onToggle` : seule l'activation explicite du bouton de
// toggle à l'intérieur de la Dialog appelle `onToggle`.
type FlavorDetailDialogProps = {
  flavor: Flavor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isTasted: boolean;
  onToggle: (id: Flavor["id"]) => void;
  // Élément vers lequel rendre le focus à la fermeture (le bouton info de la
  // tuile ayant ouvert la Dialog) — cf. Subtask 4.4, `Dialog.Popup.finalFocus`.
  finalFocusRef?: React.RefObject<HTMLElement | null>;
};

export function FlavorDetailDialog({
  flavor,
  open,
  onOpenChange,
  isTasted,
  onToggle,
  finalFocusRef,
}: FlavorDetailDialogProps) {
  const isArchived = flavor.status === "archived";

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => onOpenChange(nextOpen)}>
      <DialogContent finalFocus={finalFocusRef}>
        <img
          src={flavor.image}
          alt={flavor.name}
          className="aspect-square w-full rounded-2xl object-cover"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/placeholder-flavor.svg";
          }}
        />
        <DialogTitle>{flavor.name}</DialogTitle>
        <DialogDescription>
          {/* Statut porté textuellement, jamais seulement par une couleur (UX-DR14). */}
          {isArchived ? "Archivée" : "Active"}
        </DialogDescription>
        <button
          type="button"
          aria-pressed={isTasted}
          onClick={() => onToggle(flavor.id)}
          className="bg-primary text-primary-foreground hover:bg-primary/80 rounded-lg px-3 py-2 text-sm font-medium"
        >
          {isTasted ? "Marquer comme pas goûtée" : "Marquer comme goûtée"}
        </button>
      </DialogContent>
    </Dialog>
  );
}
