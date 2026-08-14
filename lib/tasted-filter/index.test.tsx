import { describe, expect, it, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useTastedFilter } from "./index";
import { TASTED_FILTER_STORAGE_KEY } from "./cache";

describe("useTastedFilter", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to 'all' when nothing is persisted", () => {
    const { result } = renderHook(() => useTastedFilter());

    expect(result.current.filterMode).toBe("all");
  });

  it("hydrates from persisted storage on first render", () => {
    localStorage.setItem(TASTED_FILTER_STORAGE_KEY, JSON.stringify("untasted"));

    const { result } = renderHook(() => useTastedFilter());

    expect(result.current.filterMode).toBe("untasted");
  });

  it("setFilterMode persists and reflects the new value immediately", () => {
    const { result } = renderHook(() => useTastedFilter());

    act(() => {
      result.current.setFilterMode("tasted");
    });

    expect(result.current.filterMode).toBe("tasted");
    expect(JSON.parse(localStorage.getItem(TASTED_FILTER_STORAGE_KEY) as string)).toBe("tasted");
  });
});
