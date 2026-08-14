import { describe, expect, it } from "vitest";
import { sortModeSchema } from "./sort-preference";

describe("sortModeSchema", () => {
  it("accepts 'alphabetical'", () => {
    expect(sortModeSchema.safeParse("alphabetical").success).toBe(true);
  });

  it("accepts 'rating'", () => {
    expect(sortModeSchema.safeParse("rating").success).toBe(true);
  });

  it("rejects an arbitrary string", () => {
    expect(sortModeSchema.safeParse("newest").success).toBe(false);
  });

  it("rejects a number", () => {
    expect(sortModeSchema.safeParse(1).success).toBe(false);
  });

  it("rejects null/undefined", () => {
    expect(sortModeSchema.safeParse(null).success).toBe(false);
    expect(sortModeSchema.safeParse(undefined).success).toBe(false);
  });
});
