import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  readTastedFilterMode,
  writeTastedFilterMode,
  TASTED_FILTER_STORAGE_KEY,
} from "./cache";

describe("readTastedFilterMode", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns 'all' by default when there is no stored entry", () => {
    expect(readTastedFilterMode()).toBe("all");
  });

  it("returns the stored value when a valid entry exists", () => {
    localStorage.setItem(TASTED_FILTER_STORAGE_KEY, JSON.stringify("untasted"));

    expect(readTastedFilterMode()).toBe("untasted");
  });

  it("returns 'tasted' when a valid entry exists", () => {
    localStorage.setItem(TASTED_FILTER_STORAGE_KEY, JSON.stringify("tasted"));

    expect(readTastedFilterMode()).toBe("tasted");
  });

  it("returns 'all' (never throws) when the stored value is not valid JSON", () => {
    localStorage.setItem(TASTED_FILTER_STORAGE_KEY, "{ not valid json");

    expect(() => readTastedFilterMode()).not.toThrow();
    expect(readTastedFilterMode()).toBe("all");
  });

  it("returns 'all' (never throws) when the stored value does not validate against the schema", () => {
    localStorage.setItem(TASTED_FILTER_STORAGE_KEY, JSON.stringify("yes"));

    expect(readTastedFilterMode()).toBe("all");
  });

  it("returns 'all' (never throws) when localStorage.getItem itself throws", () => {
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });

    expect(() => readTastedFilterMode()).not.toThrow();
    expect(readTastedFilterMode()).toBe("all");

    spy.mockRestore();
  });

  it("migrates a legacy boolean 'true' (non goûtées uniquement) to 'untasted'", () => {
    localStorage.setItem(TASTED_FILTER_STORAGE_KEY, JSON.stringify(true));

    expect(readTastedFilterMode()).toBe("untasted");
    // The migration is persisted in the new format.
    expect(JSON.parse(localStorage.getItem(TASTED_FILTER_STORAGE_KEY) as string)).toBe("untasted");
  });

  it("migrates a legacy boolean 'false' (toutes) to 'all'", () => {
    localStorage.setItem(TASTED_FILTER_STORAGE_KEY, JSON.stringify(false));

    expect(readTastedFilterMode()).toBe("all");
    expect(JSON.parse(localStorage.getItem(TASTED_FILTER_STORAGE_KEY) as string)).toBe("all");
  });
});

describe("writeTastedFilterMode", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists the chosen value under the namespaced key", () => {
    writeTastedFilterMode("tasted");

    expect(JSON.parse(localStorage.getItem(TASTED_FILTER_STORAGE_KEY) as string)).toBe("tasted");
  });

  it("never throws when localStorage.setItem fails", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(() => writeTastedFilterMode("untasted")).not.toThrow();

    spy.mockRestore();
  });
});
