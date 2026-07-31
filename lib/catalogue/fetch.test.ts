import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { fetchCatalogue, CATALOGUE_URL } from "./fetch";

const validCatalogue = {
  generatedAt: "2026-07-31T00:00:00.000Z",
  flavors: [{ id: "curry-doux", name: "Curry Doux", image: "https://x/curry.png", status: "active" }],
};

describe("fetchCatalogue", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches CATALOGUE_URL and returns a validated success result", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => validCatalogue,
    } as unknown as Response);

    const result = await fetchCatalogue();

    expect(fetch).toHaveBeenCalledWith(CATALOGUE_URL, expect.objectContaining({ signal: expect.anything() }));
    expect(result).toEqual({ success: true, data: validCatalogue });
  });

  it("[Review] passes an AbortSignal with a timeout so a hung request never blocks forever", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => validCatalogue,
    } as unknown as Response);

    await fetchCatalogue();

    const [, options] = vi.mocked(fetch).mock.calls[0];
    expect(options?.signal).toBeInstanceOf(AbortSignal);
  });

  it("returns a failure result (never throws) on a non-2xx response", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    } as unknown as Response);

    const result = await fetchCatalogue();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.join(" ")).toMatch(/404/);
    }
  });

  it("returns a failure result (never throws) when the body is not valid JSON", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError("Unexpected token");
      },
    } as unknown as Response);

    const result = await fetchCatalogue();

    expect(result.success).toBe(false);
  });

  it("returns a failure result (never throws) when the JSON does not validate against the schema", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ flavors: [] }),
    } as unknown as Response);

    const result = await fetchCatalogue();

    expect(result.success).toBe(false);
  });

  it("returns a failure result (never throws) when fetch itself rejects (network error)", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Failed to fetch"));

    const result = await fetchCatalogue();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.join(" ")).toMatch(/Failed to fetch/);
    }
  });
});
