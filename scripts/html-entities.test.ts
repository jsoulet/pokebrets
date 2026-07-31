import { describe, expect, it } from "vitest";
import { decodeHtmlEntities } from "./html-entities";

describe("decodeHtmlEntities", () => {
  it("decodes the numeric ampersand entity used by brets.fr product titles", () => {
    expect(decodeHtmlEntities("Ail Confit &#038; Herbes de Provence")).toBe(
      "Ail Confit & Herbes de Provence",
    );
  });

  it("decodes common named entities", () => {
    expect(decodeHtmlEntities("&amp;")).toBe("&");
    expect(decodeHtmlEntities("Cr&eacute;pe")).toBe("Crépe");
    expect(decodeHtmlEntities("Bl&egrave;s")).toBe("Blès");
  });

  it("decodes arbitrary numeric decimal entities", () => {
    expect(decodeHtmlEntities("&#233;t&#233;")).toBe("été");
  });

  it("decodes arbitrary numeric hex entities", () => {
    expect(decodeHtmlEntities("&#x2019;")).toBe("\u2019");
  });

  it("leaves plain text without entities unchanged", () => {
    expect(decodeHtmlEntities("Fromage du Jura")).toBe("Fromage du Jura");
  });

  it("returns an empty string for an empty input", () => {
    expect(decodeHtmlEntities("")).toBe("");
  });
});
