import { z } from "zod";

// État de dégustation : map id de Saveur -> booléen goûté/pas goûté.
// Forme normative (AD-7) — jamais un tableau, pour permettre une jointure par
// identifiant stable (AD-1) sans scan linéaire lors du toggle (story 1.5).
export const tastedStateSchema = z.record(z.string(), z.boolean());

export type TastedState = z.infer<typeof tastedStateSchema>;
