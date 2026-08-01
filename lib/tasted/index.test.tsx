import { describe, expect, it, beforeEach, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useTasted } from "./index";
import { TASTED_STORAGE_KEY } from "./cache";

describe("useTasted", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("hydrates tastedIds/tastedCount from persisted storage on first render", () => {
    localStorage.setItem(TASTED_STORAGE_KEY, JSON.stringify({ "curry-doux": true }));

    const { result } = renderHook(() => useTasted());

    expect(result.current.isTasted("curry-doux")).toBe(true);
    expect(result.current.tastedIds.has("curry-doux")).toBe(true);
    expect(result.current.tastedCount).toBe(1);
  });

  it("starts with an empty set and zero count when nothing is persisted", () => {
    const { result } = renderHook(() => useTasted());

    expect(result.current.tastedIds.size).toBe(0);
    expect(result.current.tastedCount).toBe(0);
    expect(result.current.isTasted("curry-doux")).toBe(false);
  });

  it("toggleTasted immediately flips a flavor to tasted and persists it", () => {
    const { result } = renderHook(() => useTasted());

    act(() => {
      result.current.toggleTasted("curry-doux");
    });

    expect(result.current.isTasted("curry-doux")).toBe(true);
    expect(result.current.tastedCount).toBe(1);
    expect(JSON.parse(localStorage.getItem(TASTED_STORAGE_KEY) as string)).toEqual({
      "curry-doux": true,
    });
  });

  it("toggleTasted flips an already-tasted flavor back off and removes it from storage", () => {
    localStorage.setItem(TASTED_STORAGE_KEY, JSON.stringify({ "curry-doux": true }));
    const { result } = renderHook(() => useTasted());

    act(() => {
      result.current.toggleTasted("curry-doux");
    });

    expect(result.current.isTasted("curry-doux")).toBe(false);
    expect(result.current.tastedCount).toBe(0);
    expect(JSON.parse(localStorage.getItem(TASTED_STORAGE_KEY) as string)).toEqual({});
  });

  it("setTasted sets an explicit tasted/not-tasted value regardless of current state", () => {
    const { result } = renderHook(() => useTasted());

    act(() => {
      result.current.setTasted("curry-doux", true);
    });
    expect(result.current.isTasted("curry-doux")).toBe(true);

    act(() => {
      result.current.setTasted("curry-doux", true);
    });
    expect(result.current.isTasted("curry-doux")).toBe(true);
    expect(result.current.tastedCount).toBe(1);
  });

  it("tracks multiple flavors independently and reflects an accurate running count", () => {
    const { result } = renderHook(() => useTasted());

    act(() => {
      result.current.toggleTasted("curry-doux");
      result.current.toggleTasted("poulet-basquaise");
    });

    expect(result.current.tastedCount).toBe(2);
    expect(result.current.tastedIds.has("curry-doux")).toBe(true);
    expect(result.current.tastedIds.has("poulet-basquaise")).toBe(true);
  });

  it("handles rapid successive toggles on the same flavor without losing the final state", () => {
    const { result } = renderHook(() => useTasted());

    act(() => {
      result.current.toggleTasted("curry-doux");
      result.current.toggleTasted("curry-doux");
      result.current.toggleTasted("curry-doux");
    });

    // odd number of toggles from "not tasted" => ends up tasted
    expect(result.current.isTasted("curry-doux")).toBe(true);
    expect(result.current.tastedCount).toBe(1);
    expect(JSON.parse(localStorage.getItem(TASTED_STORAGE_KEY) as string)).toEqual({
      "curry-doux": true,
    });
  });

  it("does not crash when the underlying persistence fails (still updates in-memory state)", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    const { result } = renderHook(() => useTasted());

    expect(() => {
      act(() => {
        result.current.toggleTasted("curry-doux");
      });
    }).not.toThrow();

    expect(result.current.isTasted("curry-doux")).toBe(true);

    spy.mockRestore();
  });
});
