import { z } from "zod";
import { flavorIdSchema } from "./flavor";

// État de notation : map id de Saveur -> note entière 1-5 étoiles.
// Miroir exact de `tastedStateSchema` (map sparse, jamais un tableau) : une
// saveur absente de la map signifie "non notée", jamais une valeur `0`
// explicite (cf. Story 2.1, Dev Notes — anti-pattern à éviter).
export const ratingStateSchema = z.record(flavorIdSchema, z.number().int().min(1).max(5));

export type RatingState = z.infer<typeof ratingStateSchema>;
