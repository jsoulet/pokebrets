import { z } from "zod";

// Enum fermé plutôt qu'une string libre (cf. `flavorStatusSchema`) : protège
// contre une valeur corrompue en `localStorage` — toute valeur hors de
// l'énumération est rejetée et traitée comme "absente" par `readSortMode()`
// (repli sur le défaut "alphabetical", Story 2.2 AC #4).
export const sortModeSchema = z.enum(["alphabetical", "rating"]);

export type SortMode = z.infer<typeof sortModeSchema>;
