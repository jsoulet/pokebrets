import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useCatalogue } from "./index";
import { CATALOGUE_CACHE_KEY } from "./cache";

const olderCatalogue = {
  generatedAt: "2026-07-01T00:00:00.000Z",
  flavors: [{ id: "curry-doux", name: "Curry Doux (v1)", image: "https://x/curry.png", status: "active" }],
};

const newerCatalogue = {
  generatedAt: "2026-07-31T00:00:00.000Z",
  flavors: [{ id: "curry-doux", name: "Curry Doux (v2)", image: "https://x/curry.png", status: "active" }],
};

function mockFetchOnce(response: { ok: boolean; status?: number; json: () => Promise<unknown> }) {
  vi.mocked(fetch).mockResolvedValueOnce({
    ok: response.ok,
    status: response.status ?? (response.ok ? 200 : 500),
    json: response.json,
  } as unknown as Response);
}

describe("useCatalogue", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("Subtask 5.2: shows cached data immediately, then replaces it with a newer network response", async () => {
    localStorage.setItem(CATALOGUE_CACHE_KEY, JSON.stringify(olderCatalogue));
    mockFetchOnce({ ok: true, json: async () => newerCatalogue });

    const { result } = renderHook(() => useCatalogue());

    // Cache-first: ready immediately, no loading screen.
    expect(result.current.status).toBe("ready");
    expect(result.current.data).toEqual(olderCatalogue);

    await waitFor(() => expect(result.current.data).toEqual(newerCatalogue));
    expect(result.current.status).toBe("ready");
    expect(JSON.parse(localStorage.getItem(CATALOGUE_CACHE_KEY) as string)).toEqual(newerCatalogue);
  });

  it("Subtask 5.3: no cache + successful fetch goes loading -> ready and writes the cache", async () => {
    mockFetchOnce({ ok: true, json: async () => newerCatalogue });

    const { result } = renderHook(() => useCatalogue());

    expect(result.current.status).toBe("loading");
    expect(result.current.data).toBeNull();

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.data).toEqual(newerCatalogue);
    expect(JSON.parse(localStorage.getItem(CATALOGUE_CACHE_KEY) as string)).toEqual(newerCatalogue);
  });

  it("Subtask 5.4: no cache + network failure -> error with an actionable message", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Failed to fetch"));

    const { result } = renderHook(() => useCatalogue());

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.data).toBeNull();
    expect(result.current.error).toMatch(/Impossible de charger le catalogue/);
  });

  it("Subtask 5.4: no cache + non-2xx response -> error", async () => {
    mockFetchOnce({ ok: false, status: 404, json: async () => ({}) });

    const { result } = renderHook(() => useCatalogue());

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toMatch(/Impossible de charger le catalogue/);
  });

  it("Subtask 5.4: no cache + invalid JSON body -> error", async () => {
    mockFetchOnce({
      ok: true,
      json: async () => {
        throw new SyntaxError("Unexpected token");
      },
    });

    const { result } = renderHook(() => useCatalogue());

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toMatch(/Impossible de charger le catalogue/);
  });

  it("Subtask 5.5: cache existing + revalidation network failure -> cache kept intact, still ready", async () => {
    localStorage.setItem(CATALOGUE_CACHE_KEY, JSON.stringify(olderCatalogue));
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Failed to fetch"));

    const { result } = renderHook(() => useCatalogue());

    expect(result.current.status).toBe("ready");
    expect(result.current.data).toEqual(olderCatalogue);

    // Let the background revalidation settle without throwing/erroring.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.status).toBe("ready");
    expect(result.current.data).toEqual(olderCatalogue);
    expect(result.current.error).toBeNull();
  });

  it("Subtask 5.5: cache existing + revalidation non-2xx -> cache kept intact", async () => {
    localStorage.setItem(CATALOGUE_CACHE_KEY, JSON.stringify(olderCatalogue));
    mockFetchOnce({ ok: false, status: 500, json: async () => ({}) });

    const { result } = renderHook(() => useCatalogue());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.status).toBe("ready");
    expect(result.current.data).toEqual(olderCatalogue);
  });

  it("Subtask 5.5: cache existing + revalidation invalid JSON -> cache kept intact", async () => {
    localStorage.setItem(CATALOGUE_CACHE_KEY, JSON.stringify(olderCatalogue));
    mockFetchOnce({
      ok: true,
      json: async () => {
        throw new SyntaxError("bad json");
      },
    });

    const { result } = renderHook(() => useCatalogue());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.status).toBe("ready");
    expect(result.current.data).toEqual(olderCatalogue);
  });

  it("Subtask 5.6: an older concurrent response arriving after a newer one is ignored", async () => {
    // Simulate retry() firing a second fetch that resolves with an OLDER
    // generatedAt after the first (newer) response already applied.
    mockFetchOnce({ ok: true, json: async () => newerCatalogue });

    const { result } = renderHook(() => useCatalogue());

    await waitFor(() => expect(result.current.data).toEqual(newerCatalogue));

    mockFetchOnce({ ok: true, json: async () => olderCatalogue });
    act(() => {
      result.current.retry();
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Freshness never regresses: the older response must be discarded.
    expect(result.current.data).toEqual(newerCatalogue);
    expect(JSON.parse(localStorage.getItem(CATALOGUE_CACHE_KEY) as string)).toEqual(newerCatalogue);
  });

  it("[Review] Subtask 4.3/AC #4: an equal instant serialized differently (with vs without milliseconds) is not treated as newer", async () => {
    // Same instant as `newerCatalogue.generatedAt`, but serialized without
    // milliseconds — a raw string comparison would treat this as different
    // (and potentially "older" or "newer" depending on lexical order), while
    // a timestamp comparison correctly recognizes it as the same instant.
    const sameInstantDifferentSerialization = {
      ...newerCatalogue,
      generatedAt: "2026-07-31T00:00:00Z",
    };
    mockFetchOnce({ ok: true, json: async () => newerCatalogue });

    const { result } = renderHook(() => useCatalogue());

    await waitFor(() => expect(result.current.data).toEqual(newerCatalogue));

    mockFetchOnce({ ok: true, json: async () => sameInstantDifferentSerialization });
    act(() => {
      result.current.retry();
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Not strictly newer (same instant) -> silently ignored, no regression,
    // no crash, cache stays on the original serialization.
    expect(result.current.data).toEqual(newerCatalogue);
    expect(JSON.parse(localStorage.getItem(CATALOGUE_CACHE_KEY) as string)).toEqual(newerCatalogue);
  });

  it("Subtask 5.7: corrupted local cache (invalid JSON) is treated as no cache, never crashes", async () => {
    localStorage.setItem(CATALOGUE_CACHE_KEY, "{ not valid json");
    mockFetchOnce({ ok: true, json: async () => newerCatalogue });

    const { result } = renderHook(() => useCatalogue());

    expect(result.current.status).toBe("loading");

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.data).toEqual(newerCatalogue);
  });

  it("Subtask 5.7: corrupted local cache (schema-invalid) is treated as no cache", async () => {
    localStorage.setItem(CATALOGUE_CACHE_KEY, JSON.stringify({ flavors: [] }));
    mockFetchOnce({ ok: true, json: async () => newerCatalogue });

    const { result } = renderHook(() => useCatalogue());

    expect(result.current.status).toBe("loading");

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.data).toEqual(newerCatalogue);
  });

  it("Subtask 5.8: retry() after an error state can recover to ready when the network returns", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Failed to fetch"));

    const { result } = renderHook(() => useCatalogue());

    await waitFor(() => expect(result.current.status).toBe("error"));

    mockFetchOnce({ ok: true, json: async () => newerCatalogue });
    act(() => {
      result.current.retry();
    });

    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.data).toEqual(newerCatalogue);
    expect(result.current.error).toBeNull();
  });

  it("[Review] never updates state after the component unmounts (no orphaned setState)", async () => {
    let resolveFetch!: (value: unknown) => void;
    vi.mocked(fetch).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFetch = resolve;
      }) as Promise<Response>,
    );

    const { unmount } = renderHook(() => useCatalogue());

    unmount();

    // The fetch resolves only after the component is gone — this must not
    // throw the "state update on an unmounted component" React warning nor
    // crash, thanks to the isMountedRef guard.
    await act(async () => {
      resolveFetch({ ok: true, status: 200, json: async () => newerCatalogue });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });
});
