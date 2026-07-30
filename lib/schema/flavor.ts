import { z } from "zod";

// Statuts possibles d'une Saveur — jamais supprimée du Catalogue, seulement archivée (AD-1).
export const flavorStatusSchema = z.enum(["active", "archived"]);

// Identifiant de Saveur : slug stable (kebab-case), minté une seule fois par le
// scraper (AD-1, AD-7). Ce schéma valide UNIQUEMENT le format du slug — il ne
// fournit aucune fonction de génération de slug depuis `name` : un renommage
// d'affichage ne doit jamais changer l'identifiant.
const flavorIdSchema = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "L'identifiant doit être un slug kebab-case (ex: curry-doux)");

export const flavorSchema = z.object({
  id: flavorIdSchema,
  name: z.string().min(1, "Le nom ne peut pas être vide"),
  image: z.string().min(1, "L'image ne peut pas être vide"),
  status: flavorStatusSchema,
});

export type FlavorStatus = z.infer<typeof flavorStatusSchema>;
export type Flavor = z.infer<typeof flavorSchema>;
