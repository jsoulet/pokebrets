import { describe, expect, it } from "vitest";
import { parseCatalogue, parseFlavor, parseTastedState } from "./index";

describe("parseFlavor", () => {
  it("returns success with typed data for a valid flavor", () => {
    const result = parseFlavor({
      id: "curry-doux",
      name: "Curry Doux",
      image: "/images/curry-doux.png",
      status: "active",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("curry-doux");
    }
  });

  it("returns an exploitable error list for an invalid flavor, never throws", () => {
    expect(() =>
      parseFlavor({
        id: "Curry Doux",
        name: "Curry Doux",
        image: "/images/curry-doux.png",
        status: "unknown",
      }),
    ).not.toThrow();

    const result = parseFlavor({
      id: "Curry Doux",
      name: "Curry Doux",
      image: "/images/curry-doux.png",
      status: "unknown",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(Array.isArray(result.error)).toBe(true);
      expect(result.error.length).toBeGreaterThan(0);
    }
  });
});

describe("parseCatalogue", () => {
  it("returns success with typed data for a valid catalogue", () => {
    const result = parseCatalogue({
      generatedAt: "2026-07-30T12:00:00.000Z",
      flavors: [
        { id: "curry-doux", name: "Curry Doux", image: "/images/curry-doux.png", status: "active" },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("returns an exploitable error list for an invalid catalogue, never throws", () => {
    expect(() => parseCatalogue({ generatedAt: "not-a-date", flavors: [] })).not.toThrow();

    const result = parseCatalogue({ generatedAt: "not-a-date", flavors: [] });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(Array.isArray(result.error)).toBe(true);
      expect(result.error.length).toBeGreaterThan(0);
    }
  });
});

describe("parseTastedState", () => {
  it("returns success with typed data for a valid tasted state", () => {
    const result = parseTastedState({ "curry-doux": true });

    expect(result.success).toBe(true);
  });

  it("returns an exploitable error list for an invalid tasted state, never throws", () => {
    expect(() => parseTastedState({ "curry-doux": "yes" })).not.toThrow();

    const result = parseTastedState({ "curry-doux": "yes" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(Array.isArray(result.error)).toBe(true);
      expect(result.error.length).toBeGreaterThan(0);
    }
  });
});
