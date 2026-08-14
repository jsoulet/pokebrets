import { z } from "zod";

// Extension du filtre "non goûtées uniquement" (Story 2.3) en un filtre à
// 3 états exclusifs, pour permettre aussi d'afficher uniquement les Saveurs
// déjà goûtées sans ajouter un second contrôle séparé dans la toolbar (juste
// une 3e option dans le même groupe segmenté). `z.enum` reste la solution la
// plus légère qui permette un `parse*` dédié, cohérent avec le principe
// "jamais de JSON.parse non validé" appliqué partout ailleurs (AD-3/AD-7).
export const tastedFilterModeSchema = z.enum(["all", "tasted", "untasted"]);

export type TastedFilterMode = z.infer<typeof tastedFilterModeSchema>;
