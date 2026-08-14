import { describe, expect, it } from "vitest";
import { tastedFilterModeSchema } from "./tasted-filter";

describe("tastedFilterModeSchema", () => {
  it("accepts 'all'", () => {
    expect(tastedFilterModeSchema.safeParse("all").success).toBe(true);
  });

  it("accepts 'tasted'", () => {
    expect(tastedFilterModeSchema.safeParse("tasted").success).toBe(true);
  });

  it("accepts 'untasted'", () => {
    expect(tastedFilterModeSchema.safeParse("untasted").success).toBe(true);
  });

  it("rejects an arbitrary string", () => {
    expect(tastedFilterModeSchema.safeParse("other").success).toBe(false);
  });

  it("rejects a legacy boolean value", () => {
    expect(tastedFilterModeSchema.safeParse(true).success).toBe(false);
    expect(tastedFilterModeSchema.safeParse(false).success).toBe(false);
  });

  it("rejects null/undefined", () => {
    expect(tastedFilterModeSchema.safeParse(null).success).toBe(false);
    expect(tastedFilterModeSchema.safeParse(undefined).success).toBe(false);
  });
});
