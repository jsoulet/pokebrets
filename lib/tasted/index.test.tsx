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

  it("[Review regression] never treats an explicit false-valued entry as tasted (defensive against off-canonical-path writes)", () => {
    // The shared schema (tastedStateSchema = z.record(id, boolean())) still
    // technically allows a `false` value even though the canonical writer
    // (setTasted) only ever stores `true` or deletes the key. Some
    // out-of-band write (manual storage edit, future migration) could still
    // persist `false` explicitly — tastedIds/isTasted must stay consistent
    // in that case rather than disagreeing with each other.
    localStorage.setItem(TASTED_STORAGE_KEY, JSON.stringify({ "curry-doux": false }));

    const { result } = renderHook(() => useTasted());

    expect(result.current.isTasted("curry-doux")).toBe(false);
    expect(result.current.tastedIds.has("curry-doux")).toBe(false);
    expect(result.current.tastedCount).toBe(0);
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

  it("[Review regression] correctly alternates back to un-tasted on an EVEN number of rapid successive toggles (two taps before React re-renders)", () => {
    // This is the exact case that exposed the stale-closure bug found in
    // code review: toggleTasted() must never derive "next" from the
    // render-time `state` closure, since two calls issued before React
    // commits a re-render would both read the same stale value and both
    // push the same boolean instead of alternating.
    const { result } = renderHook(() => useTasted());

    act(() => {
      result.current.toggleTasted("curry-doux");
      result.current.toggleTasted("curry-doux");
    });

    expect(result.current.isTasted("curry-doux")).toBe(false);
    expect(result.current.tastedCount).toBe(0);
    expect(JSON.parse(localStorage.getItem(TASTED_STORAGE_KEY) as string)).toEqual({});
  });

  it("toggleTasted returns the resulting boolean state synchronously, for callers that must react to the exact outcome (e.g. screen-reader announcements)", () => {
    const { result } = renderHook(() => useTasted());

    let firstReturn: boolean | undefined;
    let secondReturn: boolean | undefined;

    act(() => {
      firstReturn = result.current.toggleTasted("curry-doux");
    });
    act(() => {
      secondReturn = result.current.toggleTasted("curry-doux");
    });

    expect(firstReturn).toBe(true);
    expect(secondReturn).toBe(false);
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
