import { describe, expect, it } from "vitest";
import { sortFlavors } from "./sort";
import type { Flavor } from "../schema";

function makeFlavor(id: string, name: string): Flavor {
  return { id, name, image: "/placeholder.png", status: "active" };
}

describe("sortFlavors", () => {
  it("sorts alphabetically (case-insensitive, accent-insensitive)", () => {
    const flavors = [makeFlavor("z", "Zeste"), makeFlavor("a", "à l'ancienne"), makeFlavor("b", "Barbecue")];

    const result = sortFlavors(flavors, "alphabetical", () => undefined);

    expect(result.map((f) => f.name)).toEqual(["à l'ancienne", "Barbecue", "Zeste"]);
  });

  it("does not mutate the input array in alphabetical mode", () => {
    const flavors = [makeFlavor("z", "Zeste"), makeFlavor("a", "Ancienne")];
    const original = [...flavors];

    sortFlavors(flavors, "alphabetical", () => undefined);

    expect(flavors).toEqual(original);
  });

  it("sorts by rating descending, with unrated flavors always last", () => {
    const flavors = [
      makeFlavor("unrated", "Sans note"),
      makeFlavor("low", "Note basse"),
      makeFlavor("high", "Note haute"),
    ];
    const ratings: Record<string, number> = { low: 2, high: 5 };

    const result = sortFlavors(flavors, "rating", (id) => ratings[id]);

    expect(result.map((f) => f.id)).toEqual(["high", "low", "unrated"]);
  });

  it("uses alphabetical order as a secondary criterion on rating ties", () => {
    const flavors = [makeFlavor("b", "Barbecue"), makeFlavor("a", "Ancienne")];
    const ratings: Record<string, number> = { b: 4, a: 4 };

    const result = sortFlavors(flavors, "rating", (id) => ratings[id]);

    expect(result.map((f) => f.id)).toEqual(["a", "b"]);
  });

  it("does not mutate the input array in rating mode", () => {
    const flavors = [makeFlavor("z", "Zeste"), makeFlavor("a", "Ancienne")];
    const original = [...flavors];

    sortFlavors(flavors, "rating", () => undefined);

    expect(flavors).toEqual(original);
  });

  it("returns an empty array for an empty input", () => {
    expect(sortFlavors([], "alphabetical", () => undefined)).toEqual([]);
    expect(sortFlavors([], "rating", () => undefined)).toEqual([]);
  });

  it("never crashes on a single-element array", () => {
    const flavors = [makeFlavor("only", "Seule saveur")];

    expect(() => sortFlavors(flavors, "alphabetical", () => undefined)).not.toThrow();
    expect(() => sortFlavors(flavors, "rating", () => undefined)).not.toThrow();
  });
});
