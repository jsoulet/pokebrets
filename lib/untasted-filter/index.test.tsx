import { describe, expect, it, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useUntastedFilter } from "./index";
import { UNTASTED_FILTER_STORAGE_KEY } from "./cache";

describe("useUntastedFilter", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to false (disabled) when nothing is persisted", () => {
    const { result } = renderHook(() => useUntastedFilter());

    expect(result.current.showOnlyUntasted).toBe(false);
  });

  it("hydrates from persisted storage on first render", () => {
    localStorage.setItem(UNTASTED_FILTER_STORAGE_KEY, JSON.stringify(true));

    const { result } = renderHook(() => useUntastedFilter());

    expect(result.current.showOnlyUntasted).toBe(true);
  });

  it("setShowOnlyUntasted persists and reflects the new value immediately", () => {
    const { result } = renderHook(() => useUntastedFilter());

    act(() => {
      result.current.setShowOnlyUntasted(true);
    });

    expect(result.current.showOnlyUntasted).toBe(true);
    expect(JSON.parse(localStorage.getItem(UNTASTED_FILTER_STORAGE_KEY) as string)).toBe(true);
  });
});
