import { describe, expect, it, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSortPreference } from "./index";
import { SORT_PREFERENCE_STORAGE_KEY } from "./cache";

describe("useSortPreference", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to 'alphabetical' when nothing is persisted", () => {
    const { result } = renderHook(() => useSortPreference());

    expect(result.current.sortMode).toBe("alphabetical");
  });

  it("hydrates from persisted storage on first render", () => {
    localStorage.setItem(SORT_PREFERENCE_STORAGE_KEY, JSON.stringify("rating"));

    const { result } = renderHook(() => useSortPreference());

    expect(result.current.sortMode).toBe("rating");
  });

  it("setSortMode persists and reflects the new mode immediately", () => {
    const { result } = renderHook(() => useSortPreference());

    act(() => {
      result.current.setSortMode("rating");
    });

    expect(result.current.sortMode).toBe("rating");
    expect(JSON.parse(localStorage.getItem(SORT_PREFERENCE_STORAGE_KEY) as string)).toBe("rating");
  });
});
