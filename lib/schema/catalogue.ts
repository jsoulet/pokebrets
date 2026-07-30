import { z } from "zod";
import { flavorSchema } from "./flavor";

// `generatedAt` est le marqueur de révision monotone (AD-2) que `lib/catalogue/`
// (story 1.3) comparera pour rejeter toute réponse réseau antérieure au cache
// actuellement détenu. Cette story se contente de le typer/valider (ISO 8601) —
// la logique de comparaison de fraîcheur n'est pas dans le scope de 1.2.
export const catalogueSchema = z
  .object({
    generatedAt: z.iso.datetime(),
    // Un tableau vide est rejeté : il serait indistinguable d'un scraping
    // tronqué/échoué, ce qui empêcherait AD-3 de déclencher son repli d'erreur.
    flavors: z.array(flavorSchema).min(1, "Le catalogue doit contenir au moins une saveur"),
  })
  .strict()
  .superRefine((catalogue, ctx) => {
    const seen = new Set<string>();

    catalogue.flavors.forEach((flavor, index) => {
      if (seen.has(flavor.id)) {
        ctx.addIssue({
          code: "custom",
          message: `L'identifiant "${flavor.id}" est dupliqué dans le catalogue`,
          path: ["flavors", index, "id"],
        });
      }

      seen.add(flavor.id);
    });
  });

export type Catalogue = z.infer<typeof catalogueSchema>;
