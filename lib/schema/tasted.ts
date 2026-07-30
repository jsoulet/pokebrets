import { z } from "zod";
import { flavorIdSchema } from "./flavor";

// État de dégustation : map id de Saveur -> booléen goûté/pas goûté.
// Forme normative (AD-7) — jamais un tableau, pour permettre une jointure par
// identifiant stable (AD-1) sans scan linéaire lors du toggle (story 1.5).
// Les clés réutilisent le même schéma de slug que `Flavor.id` : ceci garantit
// la joignabilité et exclut les clés spéciales type `__proto__`.
export const tastedStateSchema = z.record(flavorIdSchema, z.boolean());

export type TastedState = z.infer<typeof tastedStateSchema>;
