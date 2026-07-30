import { describe, expect, it } from "vitest";
import { flavorIdSchema, flavorSchema } from "./flavor";

describe("flavorIdSchema", () => {
  it("is exported for reuse by other schemas (e.g. tastedStateSchema keys)", () => {
    expect(flavorIdSchema.safeParse("curry-doux").success).toBe(true);
    expect(flavorIdSchema.safeParse("Curry Doux").success).toBe(false);
  });
});


describe("flavorSchema", () => {
  it("accepts a well-formed active flavor", () => {
    const result = flavorSchema.safeParse({
      id: "curry-doux",
      name: "Curry Doux",
      image: "/images/curry-doux.png",
      status: "active",
    });

    expect(result.success).toBe(true);
  });

  it("accepts a well-formed archived flavor", () => {
    const result = flavorSchema.safeParse({
      id: "poulet-basquaise",
      name: "Poulet Basquaise",
      image: "https://example.com/poulet-basquaise.png",
      status: "archived",
    });

    expect(result.success).toBe(true);
  });

  it("rejects a missing field", () => {
    const result = flavorSchema.safeParse({
      id: "curry-doux",
      name: "Curry Doux",
      status: "active",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a status outside active/archived", () => {
    const result = flavorSchema.safeParse({
      id: "curry-doux",
      name: "Curry Doux",
      image: "/images/curry-doux.png",
      status: "discontinued",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an id containing uppercase letters", () => {
    const result = flavorSchema.safeParse({
      id: "Curry-Doux",
      name: "Curry Doux",
      image: "/images/curry-doux.png",
      status: "active",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an id containing spaces", () => {
    const result = flavorSchema.safeParse({
      id: "curry doux",
      name: "Curry Doux",
      image: "/images/curry-doux.png",
      status: "active",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an id containing underscores", () => {
    const result = flavorSchema.safeParse({
      id: "curry_doux",
      name: "Curry Doux",
      image: "/images/curry-doux.png",
      status: "active",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an empty name", () => {
    const result = flavorSchema.safeParse({
      id: "curry-doux",
      name: "",
      image: "/images/curry-doux.png",
      status: "active",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a name made only of whitespace", () => {
    const result = flavorSchema.safeParse({
      id: "curry-doux",
      name: "   ",
      image: "/images/curry-doux.png",
      status: "active",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an unknown extra field", () => {
    const result = flavorSchema.safeParse({
      id: "curry-doux",
      name: "Curry Doux",
      image: "/images/curry-doux.png",
      status: "active",
      extra: "not allowed",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an image using a dangerous scheme", () => {
    const result = flavorSchema.safeParse({
      id: "curry-doux",
      name: "Curry Doux",
      image: "javascript:alert(1)",
      status: "active",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an image that is neither an absolute URL nor a path", () => {
    const result = flavorSchema.safeParse({
      id: "curry-doux",
      name: "Curry Doux",
      image: "curry-doux.png",
      status: "active",
    });

    expect(result.success).toBe(false);
  });
});
