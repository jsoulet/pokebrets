import { describe, expect, it } from "vitest";
import { resolveFlavorId } from "./identity-registry";

describe("resolveFlavorId", () => {
  it("mints a new kebab-case id from the current slug on first encounter", () => {
    const { id, registry } = resolveFlavorId(8776, "ail-confit-herbes-de-provence", {});

    expect(id).toBe("ail-confit-herbes-de-provence");
    expect(registry).toEqual({ "8776": "ail-confit-herbes-de-provence" });
  });

  it("returns the already-minted id for a known bretsId, ignoring the current slug", () => {
    const existingRegistry = { "8776": "ail-confit-herbes-de-provence" };

    // Simule un renommage côté brets.fr : le slug courant a changé mais
    // l'identifiant déjà minté ne doit JAMAIS changer (AD-1).
    const { id, registry } = resolveFlavorId(8776, "ail-confit-nouveau-nom", existingRegistry);

    expect(id).toBe("ail-confit-herbes-de-provence");
    expect(registry).toEqual({ "8776": "ail-confit-herbes-de-provence" });
  });

  it("does not mutate the input registry object", () => {
    const existingRegistry = { "1": "curry-doux" };
    resolveFlavorId(2, "poulet-basquaise", existingRegistry);

    expect(existingRegistry).toEqual({ "1": "curry-doux" });
  });

  it("normalizes a slug containing uppercase or unexpected characters into a valid kebab-case id", () => {
    const { id } = resolveFlavorId(1, "Poulet_Basquaise!!", {});

    expect(id).toBe("poulet-basquaise");
  });

  it("mints independent ids for two different bretsIds seen in the same run", () => {
    const first = resolveFlavorId(1, "curry-doux", {});
    const second = resolveFlavorId(2, "poulet-basquaise", first.registry);

    expect(second.registry).toEqual({
      "1": "curry-doux",
      "2": "poulet-basquaise",
    });
  });
});
