import { z } from "zod";
import { flavorSchema } from "./flavor";

// `generatedAt` est le marqueur de révision monotone (AD-2) que `lib/catalogue/`
// (story 1.3) comparera pour rejeter toute réponse réseau antérieure au cache
// actuellement détenu. Cette story se contente de le typer/valider (ISO 8601) —
// la logique de comparaison de fraîcheur n'est pas dans le scope de 1.2.
export const catalogueSchema = z.object({
  generatedAt: z.iso.datetime(),
  flavors: z.array(flavorSchema),
});

export type Catalogue = z.infer<typeof catalogueSchema>;
