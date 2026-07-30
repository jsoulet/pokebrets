import { describe, expect, it } from "vitest";
import { flavorSchema } from "./flavor";

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
});
