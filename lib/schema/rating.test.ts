import { describe, expect, it } from "vitest";
import { ratingStateSchema } from "./rating";

describe("ratingStateSchema", () => {
  it("accepts an empty map", () => {
    const result = ratingStateSchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it("accepts a map with several valid ratings (1-5)", () => {
    const result = ratingStateSchema.safeParse({
      "curry-doux": 5,
      "poulet-basquaise": 1,
    });

    expect(result.success).toBe(true);
  });

  it("rejects a rating of 0", () => {
    const result = ratingStateSchema.safeParse({ "curry-doux": 0 });

    expect(result.success).toBe(false);
  });

  it("rejects a rating of 6", () => {
    const result = ratingStateSchema.safeParse({ "curry-doux": 6 });

    expect(result.success).toBe(false);
  });

  it("rejects a negative rating", () => {
    const result = ratingStateSchema.safeParse({ "curry-doux": -1 });

    expect(result.success).toBe(false);
  });

  it("rejects a floating point rating", () => {
    const result = ratingStateSchema.safeParse({ "curry-doux": 3.5 });

    expect(result.success).toBe(false);
  });

  it("rejects a string rating", () => {
    const result = ratingStateSchema.safeParse({ "curry-doux": "4" });

    expect(result.success).toBe(false);
  });

  it("rejects a value that is an array instead of a map", () => {
    const result = ratingStateSchema.safeParse([5, 4]);

    expect(result.success).toBe(false);
  });

  it("rejects a key that is not a kebab-case flavor id", () => {
    const result = ratingStateSchema.safeParse({ "Curry Doux": 5 });

    expect(result.success).toBe(false);
  });
});
