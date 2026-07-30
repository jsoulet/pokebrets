import { describe, expect, it } from "vitest";
import { catalogueSchema } from "./catalogue";

const validFlavor = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: "curry-doux",
  name: "Curry Doux",
  image: "/images/curry-doux.png",
  status: "active",
  ...overrides,
});

describe("catalogueSchema", () => {
  it("accepts a catalogue with two valid flavors and a valid ISO generatedAt", () => {
    const result = catalogueSchema.safeParse({
      generatedAt: "2026-07-30T12:00:00.000Z",
      flavors: [
        validFlavor(),
        validFlavor({ id: "poulet-basquaise", name: "Poulet Basquaise", status: "archived" }),
      ],
    });

    expect(result.success).toBe(true);
  });

  it("accepts a catalogue with an empty flavors list", () => {
    const result = catalogueSchema.safeParse({
      generatedAt: "2026-07-30T12:00:00.000Z",
      flavors: [],
    });

    expect(result.success).toBe(true);
  });

  it("rejects a non-ISO generatedAt", () => {
    const result = catalogueSchema.safeParse({
      generatedAt: "30/07/2026",
      flavors: [validFlavor()],
    });

    expect(result.success).toBe(false);
  });

  it("rejects flavors that is not an array", () => {
    const result = catalogueSchema.safeParse({
      generatedAt: "2026-07-30T12:00:00.000Z",
      flavors: validFlavor(),
    });

    expect(result.success).toBe(false);
  });

  it("rejects a catalogue containing an invalid flavor", () => {
    const result = catalogueSchema.safeParse({
      generatedAt: "2026-07-30T12:00:00.000Z",
      flavors: [validFlavor({ status: "discontinued" })],
    });

    expect(result.success).toBe(false);
  });

  it("rejects a missing generatedAt", () => {
    const result = catalogueSchema.safeParse({
      flavors: [validFlavor()],
    });

    expect(result.success).toBe(false);
  });
});
