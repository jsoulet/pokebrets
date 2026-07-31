import { describe, expect, it, vi, beforeEach } from "vitest";
import { readCache, writeCache, CATALOGUE_CACHE_KEY } from "./cache";
import type { Catalogue } from "../schema";

const validCatalogue: Catalogue = {
  generatedAt: "2026-07-31T00:00:00.000Z",
  flavors: [{ id: "curry-doux", name: "Curry Doux", image: "https://x/curry.png", status: "active" }],
};

describe("readCache", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns null when there is no cache entry", () => {
    expect(readCache()).toBeNull();
  });

  it("returns the parsed catalogue when a valid entry exists", () => {
    localStorage.setItem(CATALOGUE_CACHE_KEY, JSON.stringify(validCatalogue));

    expect(readCache()).toEqual(validCatalogue);
  });

  it("returns null (never throws) when the stored value is not valid JSON", () => {
    localStorage.setItem(CATALOGUE_CACHE_KEY, "{ not valid json");

    expect(() => readCache()).not.toThrow();
    expect(readCache()).toBeNull();
  });

  it("returns null (never throws) when the stored value does not validate against the schema", () => {
    localStorage.setItem(CATALOGUE_CACHE_KEY, JSON.stringify({ flavors: [] }));

    expect(readCache()).toBeNull();
  });

  it("returns null (never throws) when localStorage.getItem itself throws (e.g. Safari private mode)", () => {
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });

    expect(() => readCache()).not.toThrow();
    expect(readCache()).toBeNull();

    spy.mockRestore();
  });
});

describe("writeCache", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists the catalogue under the namespaced cache key", () => {
    writeCache(validCatalogue);

    expect(JSON.parse(localStorage.getItem(CATALOGUE_CACHE_KEY) as string)).toEqual(validCatalogue);
  });

  it("never throws when localStorage.setItem fails (e.g. quota exceeded)", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(() => writeCache(validCatalogue)).not.toThrow();

    spy.mockRestore();
  });
});
