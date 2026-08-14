import type { Flavor } from "@/lib/schema";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Toggle } from "@/components/ui/toggle";
import { StarRating } from "./star-rating";
import { handleFlavorImageError } from "./flavor-image-fallback";
import { PILL_BUTTON_CLASSNAME } from "./pill-button-styles";

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
  // Story 2.1 : note indépendante du statut goûté/pas goûté (AD-1, AC #5) —
  // `onRatingChange` ne touche jamais `onToggle` et réciproquement.
  rating: number | undefined;
  onRatingChange: (id: Flavor["id"], value: number | null) => void;
  // Élément vers lequel rendre le focus à la fermeture (le bouton info de la
  // tuile ayant ouvert la Dialog) — cf. Subtask 4.4, `Dialog.Popup.finalFocus`.
  finalFocusRef?: React.RefObject<HTMLElement | null>;
  // [Review] Notifie la fin réelle (montage/démontage) de la transition
  // d'ouverture/fermeture de Base UI, pour permettre à l'appelant de ne
  // démonter son propre wrapper qu'une fois la transition de sortie
  // terminée plutôt que de façon synchrone (cf. `catalogue-page-client.tsx`).
  onOpenChangeComplete?: (open: boolean) => void;
};

export function FlavorDetailDialog({
  flavor,
  open,
  onOpenChange,
  isTasted,
  onToggle,
  rating,
  onRatingChange,
  finalFocusRef,
  onOpenChangeComplete,
}: FlavorDetailDialogProps) {
  const isArchived = flavor.status === "archived";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => onOpenChange(nextOpen)}
      onOpenChangeComplete={onOpenChangeComplete}
    >
      <DialogContent
        className="items-center gap-3 text-center"
        finalFocus={() => (finalFocusRef?.current?.isConnected ? finalFocusRef.current : undefined)}
      >
        {/* [Review] Restylage (retour utilisateur, référence brets.fr) :
            micro-libellé "Saveur" + titre display centré en couleur accent
            au-dessus de l'image, plutôt que le titre par défaut du Dialog
            (petit, aligné à gauche, sans hiérarchie). */}
        <span className="text-foreground/60 font-tanker text-sm tracking-[0.2em] uppercase">
          Saveur
        </span>
        <DialogTitle className="font-tanker text-[52px] leading-[0.85] tracking-wide text-[#b5652e] uppercase">
          {flavor.name}
        </DialogTitle>
        <img
          src={flavor.image}
          alt={flavor.name}
          className="aspect-square w-full rounded-2xl object-cover"
          onError={handleFlavorImageError}
        />
        <DialogDescription>
          {/* Statut porté textuellement, jamais seulement par une couleur (UX-DR14). */}
          {isArchived ? "Cette saveur n'est plus produite" : "Active"}
        </DialogDescription>
        <Toggle
          pressed={isTasted}
          onPressedChange={() => onToggle(flavor.id)}
          className={`w-fit ${PILL_BUTTON_CLASSNAME}`}
        >
          {isTasted ? "Marquer comme pas goûtée" : "Marquer comme goûtée"}
        </Toggle>
        {/* Story 2.1 : contrôle "5 étoiles" sous le bouton toggle existant.
            N'apparaît que dans la Dialog (pas de contrôle direct sur la
            tuile, cf. décision produit — seul un badge d'affichage y est
            rendu). */}
        <StarRating value={rating} onChange={(value) => onRatingChange(flavor.id, value)} />
      </DialogContent>
    </Dialog>
  );
}
