import { describe, expect, it } from "vitest";
import { tastedStateSchema } from "./tasted";

describe("tastedStateSchema", () => {
  it("accepts an empty map", () => {
    const result = tastedStateSchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it("accepts a map with several boolean entries", () => {
    const result = tastedStateSchema.safeParse({
      "curry-doux": true,
      "poulet-basquaise": false,
    });

    expect(result.success).toBe(true);
  });

  it("rejects a value that is an array instead of a map", () => {
    const result = tastedStateSchema.safeParse(["curry-doux", "poulet-basquaise"]);

    expect(result.success).toBe(false);
  });

  it("rejects a non-boolean value in the map", () => {
    const result = tastedStateSchema.safeParse({
      "curry-doux": "true",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a null value in the map", () => {
    const result = tastedStateSchema.safeParse({
      "curry-doux": null,
    });

    expect(result.success).toBe(false);
  });

  it("rejects a key that is not a kebab-case flavor id", () => {
    const result = tastedStateSchema.safeParse({
      "Curry Doux": true,
    });

    expect(result.success).toBe(false);
  });

  it("never propagates a __proto__ key into parsed data", () => {
    const input: Record<string, unknown> = {};
    Object.defineProperty(input, "__proto__", { value: true, enumerable: true });

    const result = tastedStateSchema.safeParse(input);

    if (result.success) {
      expect(Object.prototype.hasOwnProperty.call(result.data, "__proto__")).toBe(false);
    }
  });
});
