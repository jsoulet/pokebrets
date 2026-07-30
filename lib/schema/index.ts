import type { z } from "zod";
import { catalogueSchema } from "./catalogue";
import { flavorSchema } from "./flavor";
import { tastedStateSchema } from "./tasted";

export * from "./catalogue";
export * from "./flavor";
export * from "./tasted";

// Résultat exploitable par l'appelant — jamais une exception non gérée.
// AD-3 traite un JSON hors schéma comme un échec de fetch (au même titre
// qu'une erreur réseau ou une réponse non-2xx) : ce type permet à
// `lib/catalogue/` (story 1.3) de distinguer succès/échec sans try/catch.
export type ParseResult<T> = { success: true; data: T } | { success: false; error: string[] };

function toParseResult<Schema extends z.ZodType>(
  schema: Schema,
  input: unknown,
): ParseResult<z.infer<Schema>> {
  const result = schema.safeParse(input);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: result.error.issues.map((issue) =>
      issue.path.length > 0 ? `${issue.path.join(".")}: ${issue.message}` : issue.message,
    ),
  };
}

export function parseFlavor(input: unknown): ParseResult<z.infer<typeof flavorSchema>> {
  return toParseResult(flavorSchema, input);
}

export function parseCatalogue(input: unknown): ParseResult<z.infer<typeof catalogueSchema>> {
  return toParseResult(catalogueSchema, input);
}

export function parseTastedState(input: unknown): ParseResult<z.infer<typeof tastedStateSchema>> {
  return toParseResult(tastedStateSchema, input);
}
