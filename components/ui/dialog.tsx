import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Wrapper fin autour de `@base-ui/react/dialog`, dans le même style que
// `components/ui/button.tsx` (composition de primitives Base UI + `cn()` +
// `data-slot` stables). Introduit pour Story 1.6 comme point de départ de la
// convention locale pour les overlays — aucune implémentation maison
// concurrente (pas de focus-trap manuel, pas de gestion d'Échap manuelle).
const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

function DialogBackdrop({ className, ...props }: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-backdrop"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
        className
      )}
      {...props}
    />
  );
}

type DialogContentProps = DialogPrimitive.Popup.Props & {
  showCloseButton?: boolean;
};

// [Review] Titre accessible obligatoire : tout appelant de `DialogContent`
// DOIT rendre un `DialogTitle` en premier enfant, jamais seulement une icône
// ou une image — Base UI n'impose pas cette contrainte au niveau des types,
// le seul point d'appel actuel (`flavor-detail-dialog.tsx`) le respecte déjà.
function DialogContent({
  className,
  children,
  finalFocus,
  initialFocus,
  showCloseButton = true,
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogBackdrop />
      <DialogPrimitive.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          initialFocus={initialFocus}
          finalFocus={finalFocus}
          className={cn(
            "bg-background relative flex w-full max-w-sm flex-col gap-4 rounded-2xl p-6 shadow-lg outline-none",
            className
          )}
          {...props}
        >
          {children}
          {showCloseButton ? (
            // Rendu systématiquement quand `modal` est actif (recommandation
            // Base UI) : offre une sortie explicite aux lecteurs d'écran
            // tactiles, en plus du clic extérieur et de la touche Échap.
            // Composé via `render` sur `Button` (convention locale) plutôt
            // qu'un `<button>` fait main : `DialogClose` fusionne son
            // comportement de fermeture dans l'élément rendu.
            <DialogClose
              aria-label="Fermer"
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-foreground/60 hover:text-foreground absolute top-3 right-3"
                />
              }
            >
              <XIcon aria-hidden="true" className="size-4" />
            </DialogClose>
          ) : null}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Viewport>
    </DialogPortal>
  );
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-foreground text-lg font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-foreground/70 text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogBackdrop,
  DialogContent,
  DialogTitle,
  DialogDescription,
};
