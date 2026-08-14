import { describe, expect, it, vi, beforeEach } from "vitest";
import { readRatingState, setRating, RATING_STORAGE_KEY } from "./cache";
import type { RatingState } from "../schema";

describe("readRatingState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns an empty map when there is no stored entry", () => {
    expect(readRatingState()).toEqual({});
  });

  it("returns the parsed map when a valid entry exists", () => {
    const state: RatingState = { "curry-doux": 4 };
    localStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(state));

    expect(readRatingState()).toEqual(state);
  });

  it("returns an empty map (never throws) when the stored value is not valid JSON", () => {
    localStorage.setItem(RATING_STORAGE_KEY, "{ not valid json");

    expect(() => readRatingState()).not.toThrow();
    expect(readRatingState()).toEqual({});
  });

  it("returns an empty map (never throws) when the stored value does not validate against the schema", () => {
    localStorage.setItem(RATING_STORAGE_KEY, JSON.stringify({ "curry-doux": 6 }));

    expect(readRatingState()).toEqual({});
  });

  it("returns an empty map (never throws) when localStorage.getItem itself throws", () => {
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });

    expect(() => readRatingState()).not.toThrow();
    expect(readRatingState()).toEqual({});

    spy.mockRestore();
  });
});

describe("setRating", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("persists a newly rated flavor under the namespaced key", () => {
    const result = setRating("curry-doux", 4);

    expect(result).toEqual({ "curry-doux": 4 });
    expect(JSON.parse(localStorage.getItem(RATING_STORAGE_KEY) as string)).toEqual({
      "curry-doux": 4,
    });
  });

  it("removes the key entirely when the rating is withdrawn (value === null, sparse map)", () => {
    localStorage.setItem(
      RATING_STORAGE_KEY,
      JSON.stringify({ "curry-doux": 5, "poulet-basquaise": 3 }),
    );

    const result = setRating("curry-doux", null);

    expect(result).toEqual({ "poulet-basquaise": 3 });
    expect(JSON.parse(localStorage.getItem(RATING_STORAGE_KEY) as string)).toEqual({
      "poulet-basquaise": 3,
    });
  });

  it("is a no-op result when withdrawing a rating that never existed", () => {
    const result = setRating("curry-doux", null);

    expect(result).toEqual({});
  });

  it("re-reads the latest persisted state right before writing (AD-8), avoiding a stale read-modify-write", () => {
    localStorage.setItem(RATING_STORAGE_KEY, JSON.stringify({}));
    const spy = vi.spyOn(Storage.prototype, "getItem");

    setRating("curry-doux", 3);

    expect(spy).toHaveBeenCalledWith(RATING_STORAGE_KEY);
    spy.mockRestore();
  });

  it("never throws when localStorage.setItem fails, and still returns a normalized snapshot", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(() => setRating("curry-doux", 5)).not.toThrow();
    expect(setRating("curry-doux", 5)).toEqual({ "curry-doux": 5 });

    spy.mockRestore();
  });

  it("never throws when localStorage.getItem fails during the internal re-read", () => {
    const spy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });

    expect(() => setRating("curry-doux", 5)).not.toThrow();

    spy.mockRestore();
  });
});
