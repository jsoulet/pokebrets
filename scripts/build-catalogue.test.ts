import { describe, expect, it, vi, beforeEach } from "vitest";
import { buildAndValidateCatalogue } from "./build-catalogue";
import type { Flavor } from "../lib/schema";

describe("buildAndValidateCatalogue", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it("returns success with a catalogue stamped with the current generatedAt", () => {
    const flavors: Flavor[] = [
      { id: "curry-doux", name: "Curry Doux", image: "https://cms.brets.fr/curry.png", status: "active" },
    ];

    const before = new Date();
    const result = buildAndValidateCatalogue(flavors);
    const after = new Date();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.flavors).toEqual(flavors);
      const generatedAt = new Date(result.data.generatedAt);
      expect(generatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(generatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    }
  });

  it("returns a failure with exploitable error messages for an invalid flavor list (e.g. duplicate ids)", () => {
    const flavors: Flavor[] = [
      { id: "curry-doux", name: "Curry Doux", image: "https://cms.brets.fr/curry.png", status: "active" },
      { id: "curry-doux", name: "Curry Doux Bis", image: "https://cms.brets.fr/curry2.png", status: "active" },
    ];

    const result = buildAndValidateCatalogue(flavors);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.length).toBeGreaterThan(0);
    }
  });

  it("returns a failure for an empty flavor list", () => {
    const result = buildAndValidateCatalogue([]);

    expect(result.success).toBe(false);
  });
});
