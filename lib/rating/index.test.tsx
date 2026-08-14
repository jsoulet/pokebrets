import { describe, expect, it, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useRating } from "./index";
import { RATING_STORAGE_KEY } from "./cache";

describe("useRating", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("hydrates ratings from persisted storage on first render", () => {
    localStorage.setItem(RATING_STORAGE_KEY, JSON.stringify({ "curry-doux": 4 }));

    const { result } = renderHook(() => useRating());

    expect(result.current.getRating("curry-doux")).toBe(4);
  });

  it("returns undefined for a flavor with no rating", () => {
    const { result } = renderHook(() => useRating());

    expect(result.current.getRating("curry-doux")).toBeUndefined();
  });

  it("setRating persists a new rating and reflects it immediately", () => {
    const { result } = renderHook(() => useRating());

    act(() => {
      result.current.setRating("curry-doux", 5);
    });

    expect(result.current.getRating("curry-doux")).toBe(5);
    expect(JSON.parse(localStorage.getItem(RATING_STORAGE_KEY) as string)).toEqual({
      "curry-doux": 5,
    });
  });

  it("setRating(id, null) withdraws a rating (returns to undefined)", () => {
    localStorage.setItem(RATING_STORAGE_KEY, JSON.stringify({ "curry-doux": 3 }));
    const { result } = renderHook(() => useRating());

    act(() => {
      result.current.setRating("curry-doux", null);
    });

    expect(result.current.getRating("curry-doux")).toBeUndefined();
    expect(JSON.parse(localStorage.getItem(RATING_STORAGE_KEY) as string)).toEqual({});
  });

  it("tracks multiple flavors independently", () => {
    const { result } = renderHook(() => useRating());

    act(() => {
      result.current.setRating("curry-doux", 5);
      result.current.setRating("poulet-basquaise", 2);
    });

    expect(result.current.getRating("curry-doux")).toBe(5);
    expect(result.current.getRating("poulet-basquaise")).toBe(2);
  });
});
