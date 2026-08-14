import { describe, expect, it, vi, beforeEach } from "vitest";
import { readSortMode, writeSortMode, SORT_PREFERENCE_STORAGE_KEY } from "./cache";

describe("readSortMode", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns 'alphabetical' by default when there is no stored entry", () => {
    expect(readSortMode()).toBe("alphabetical");
  });

  it("returns the stored mode when a valid entry exists", () => {
    localStorage.setItem(SORT_PREFERENCE_STORAGE_KEY, JSON.stringify("rating"));

    expect(readSortMode()).toBe("rating");
  });

  it("returns 'alphabetical' (never throws) when the stored value is not valid JSON", () => {
    localStorage.setItem(SORT_PREFERENCE_STORAGE_KEY, "{ not valid json");

    expect(() => readSortMode()).not.toThrow();
    expect(readSortMode()).toBe("alphabetical");
  });

  it("returns 'alphabetical' (never throws) when the stored value does not validate against the schema", () => {
    localStorage.setItem(SORT_PREFERENCE_STORAGE_KEY, JSON.stringify("newest"));

    expect(readSortMode()).toBe("alphabetical");
  });

  it("returns 'alphabetical' (never throws) when localStorage.getItem itself throws", () => {
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });

    expect(() => readSortMode()).not.toThrow();
    expect(readSortMode()).toBe("alphabetical");

    spy.mockRestore();
  });
});

describe("writeSortMode", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists the chosen mode under the namespaced key", () => {
    writeSortMode("rating");

    expect(JSON.parse(localStorage.getItem(SORT_PREFERENCE_STORAGE_KEY) as string)).toBe("rating");
  });

  it("never throws when localStorage.setItem fails", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(() => writeSortMode("rating")).not.toThrow();

    spy.mockRestore();
  });
});
