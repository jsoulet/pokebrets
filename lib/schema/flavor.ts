import { z } from "zod";

// Statuts possibles d'une Saveur — jamais supprimée du Catalogue, seulement archivée (AD-1).
export const flavorStatusSchema = z.enum(["active", "archived"]);

// Identifiant de Saveur : slug stable (kebab-case), minté une seule fois par le
// scraper (AD-1, AD-7). Ce schéma valide UNIQUEMENT le format du slug — il ne
// fournit aucune fonction de génération de slug depuis `name` : un renommage
// d'affichage ne doit jamais changer l'identifiant.
export const flavorIdSchema = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "L'identifiant doit être un slug kebab-case (ex: curry-doux)");

// `image` doit être soit une URL absolue http(s) (ex: source Open Food Facts),
// soit un chemin local commençant par `/` (ex: asset servi par l'app) — ce qui
// exclut de fait les schémas dangereux (`javascript:`, `data:`, etc.).
const imageSchema = z
  .string()
  .refine((value) => /^https?:\/\/.+/i.test(value) || /^\/.+/.test(value), {
    message: "L'image doit être une URL http(s) ou un chemin commençant par /",
  });

export const flavorSchema = z
  .object({
    id: flavorIdSchema,
    name: z.string().trim().min(1, "Le nom ne peut pas être vide"),
    image: imageSchema,
    status: flavorStatusSchema,
  })
  .strict();

export type FlavorStatus = z.infer<typeof flavorStatusSchema>;
export type Flavor = z.infer<typeof flavorSchema>;
