import { z } from "zod";

// Préférence scalaire booléenne — pas de fichier de schéma lourd type
// `tasted.ts`/`rating.ts` puisqu'il n'y a ni map par id de Saveur ni clé
// kebab-case à valider (Story 2.3, Dev Notes). `z.boolean()` suffit, mais on
// garde tout de même un schéma + une fonction `parse*` dédiée pour rester
// cohérent avec le principe "jamais de JSON.parse non validé" appliqué
// partout ailleurs dans ce projet (AD-3/AD-7).
export const untastedFilterPreferenceSchema = z.boolean();

export type UntastedFilterPreference = z.infer<typeof untastedFilterPreferenceSchema>;
