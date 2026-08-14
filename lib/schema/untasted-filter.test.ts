import { describe, expect, it } from "vitest";
import { untastedFilterPreferenceSchema } from "./untasted-filter";

describe("untastedFilterPreferenceSchema", () => {
  it("accepts true", () => {
    expect(untastedFilterPreferenceSchema.safeParse(true).success).toBe(true);
  });

  it("accepts false", () => {
    expect(untastedFilterPreferenceSchema.safeParse(false).success).toBe(true);
  });

  it("rejects a string", () => {
    expect(untastedFilterPreferenceSchema.safeParse("true").success).toBe(false);
  });

  it("rejects a number", () => {
    expect(untastedFilterPreferenceSchema.safeParse(1).success).toBe(false);
  });

  it("rejects null/undefined", () => {
    expect(untastedFilterPreferenceSchema.safeParse(null).success).toBe(false);
    expect(untastedFilterPreferenceSchema.safeParse(undefined).success).toBe(false);
  });
});
