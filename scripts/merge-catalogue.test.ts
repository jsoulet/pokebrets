import { describe, expect, it } from "vitest";
import { mergeSources } from "./merge-catalogue";
import type { BretsProduct } from "./sources/brets";
import type { Catalogue } from "../lib/schema";

describe("mergeSources", () => {
  it("builds active flavors from brets.fr products, resolving ids via the identity registry", () => {
    const bretsProducts: BretsProduct[] = [
      { bretsId: 1, slug: "curry-doux", name: "Curry Doux", image: "https://cms.brets.fr/curry.png" },
    ];

    const { flavors, registry } = mergeSources({
      bretsProducts,
      offMatchingTable: {},
      offProducts: [],
      previousCatalogue: null,
      registry: {},
    });

    expect(flavors).toEqual([
      { id: "curry-doux", name: "Curry Doux", image: "https://cms.brets.fr/curry.png", status: "active" },
    ]);
    expect(registry).toEqual({ "1": "curry-doux" });
  });

  it("keeps the already-minted id even if the brets.fr slug changed (rename)", () => {
    const bretsProducts: BretsProduct[] = [
      { bretsId: 1, slug: "curry-doux-nouveau", name: "Curry Doux Nouveau", image: "https://cms.brets.fr/curry.png" },
    ];

    const { flavors } = mergeSources({
      bretsProducts,
      offMatchingTable: {},
      offProducts: [],
      previousCatalogue: null,
      registry: { "1": "curry-doux" },
    });

    expect(flavors[0].id).toBe("curry-doux");
    expect(flavors[0].name).toBe("Curry Doux Nouveau");
  });

  it("archives a flavor present in the previous catalogue but absent from the new brets.fr scrape", () => {
    const previousCatalogue: Catalogue = {
      generatedAt: "2026-01-01T00:00:00.000Z",
      flavors: [
        { id: "curry-doux", name: "Curry Doux", image: "https://cms.brets.fr/curry.png", status: "active" },
        { id: "poulet-basquaise", name: "Poulet Basquaise", image: "https://cms.brets.fr/poulet.png", status: "active" },
      ],
    };
    const bretsProducts: BretsProduct[] = [
      { bretsId: 1, slug: "curry-doux", name: "Curry Doux", image: "https://cms.brets.fr/curry.png" },
    ];

    const { flavors } = mergeSources({
      bretsProducts,
      offMatchingTable: {},
      offProducts: [],
      previousCatalogue,
      registry: { "1": "curry-doux" },
    });

    const archived = flavors.find((f) => f.id === "poulet-basquaise");
    expect(archived).toEqual({
      id: "poulet-basquaise",
      name: "Poulet Basquaise",
      image: "https://cms.brets.fr/poulet.png",
      status: "archived",
    });
    expect(flavors).toHaveLength(2);
  });

  it("reactivates a previously archived flavor that reappears on brets.fr, keeping the same id", () => {
    const previousCatalogue: Catalogue = {
      generatedAt: "2026-01-01T00:00:00.000Z",
      flavors: [
        { id: "curry-doux", name: "Curry Doux", image: "https://cms.brets.fr/curry-old.png", status: "archived" },
      ],
    };
    const bretsProducts: BretsProduct[] = [
      { bretsId: 1, slug: "curry-doux", name: "Curry Doux", image: "https://cms.brets.fr/curry-new.png" },
    ];

    const { flavors } = mergeSources({
      bretsProducts,
      offMatchingTable: {},
      offProducts: [],
      previousCatalogue,
      registry: { "1": "curry-doux" },
    });

    expect(flavors).toEqual([
      { id: "curry-doux", name: "Curry Doux", image: "https://cms.brets.fr/curry-new.png", status: "active" },
    ]);
  });

  it("does not consult Open Food Facts for a flavor with complete brets.fr data", () => {
    const bretsProducts: BretsProduct[] = [
      { bretsId: 1, slug: "curry-doux", name: "Curry Doux", image: "https://cms.brets.fr/curry.png" },
    ];

    const { flavors } = mergeSources({
      bretsProducts,
      offMatchingTable: { "1": "some-off-code" },
      offProducts: [{ code: "some-off-code", name: "OFF Name", image: "https://off/img.jpg" }],
      previousCatalogue: null,
      registry: {},
    });

    // brets.fr fournit déjà nom + image : OFF ne doit jamais les remplacer.
    expect(flavors[0].name).toBe("Curry Doux");
    expect(flavors[0].image).toBe("https://cms.brets.fr/curry.png");
  });
});
