import { describe, expect, it, vi, beforeEach } from "vitest";
import { readTastedState, setTasted, TASTED_STORAGE_KEY } from "./cache";
import type { TastedState } from "../schema";

describe("readTastedState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns an empty map when there is no stored entry", () => {
    expect(readTastedState()).toEqual({});
  });

  it("returns the parsed map when a valid entry exists", () => {
    const state: TastedState = { "curry-doux": true };
    localStorage.setItem(TASTED_STORAGE_KEY, JSON.stringify(state));

    expect(readTastedState()).toEqual(state);
  });

  it("returns an empty map (never throws) when the stored value is not valid JSON", () => {
    localStorage.setItem(TASTED_STORAGE_KEY, "{ not valid json");

    expect(() => readTastedState()).not.toThrow();
    expect(readTastedState()).toEqual({});
  });

  it("returns an empty map (never throws) when the stored value does not validate against the schema", () => {
    localStorage.setItem(TASTED_STORAGE_KEY, JSON.stringify({ "curry-doux": "yes" }));

    expect(readTastedState()).toEqual({});
  });

  it("returns an empty map (never throws) when localStorage.getItem itself throws (e.g. Safari private mode)", () => {
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });

    expect(() => readTastedState()).not.toThrow();
    expect(readTastedState()).toEqual({});

    spy.mockRestore();
  });
});

describe("setTasted", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists a newly tasted flavor under the namespaced key", () => {
    const result = setTasted("curry-doux", true);

    expect(result).toEqual({ "curry-doux": true });
    expect(JSON.parse(localStorage.getItem(TASTED_STORAGE_KEY) as string)).toEqual({
      "curry-doux": true,
    });
  });

  it("removes the key entirely when un-tasting a flavor (sparse map, absent key = not tasted)", () => {
    localStorage.setItem(TASTED_STORAGE_KEY, JSON.stringify({ "curry-doux": true, "poulet-basquaise": true }));

    const result = setTasted("curry-doux", false);

    expect(result).toEqual({ "poulet-basquaise": true });
    expect(JSON.parse(localStorage.getItem(TASTED_STORAGE_KEY) as string)).toEqual({
      "poulet-basquaise": true,
    });
  });

  it("is a no-op result when un-tasting a flavor that was never tasted", () => {
    const result = setTasted("curry-doux", false);

    expect(result).toEqual({});
  });

  it("re-reads the latest persisted state right before writing (AD-8), avoiding a stale read-modify-write", () => {
    // Simulates a concurrent write (another tab/rapid tap) landing between
    // this call's "logical" snapshot and its actual write: setTasted must
    // read fresh from storage internally rather than trust a stale in-memory
    // snapshot passed in from the caller.
    localStorage.setItem(TASTED_STORAGE_KEY, JSON.stringify({}));
    const spy = vi.spyOn(Storage.prototype, "getItem");

    setTasted("curry-doux", true);

    expect(spy).toHaveBeenCalledWith(TASTED_STORAGE_KEY);
    spy.mockRestore();
  });

  it("never throws when localStorage.setItem fails (e.g. quota exceeded), and still returns a normalized snapshot", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(() => setTasted("curry-doux", true)).not.toThrow();
    expect(setTasted("curry-doux", true)).toEqual({ "curry-doux": true });

    spy.mockRestore();
  });

  it("never throws when localStorage.getItem fails during the internal re-read", () => {
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });

    expect(() => setTasted("curry-doux", true)).not.toThrow();

    spy.mockRestore();
  });
});
