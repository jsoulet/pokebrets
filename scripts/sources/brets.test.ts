import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { fetchBretsProducts } from "./brets";

function mockResponse(body: unknown, headers: Record<string, string> = {}) {
  return {
    ok: true,
    status: 200,
    headers: new Headers({ "x-wp-totalpages": "1", ...headers }),
    json: async () => body,
  } as unknown as Response;
}

describe("fetchBretsProducts", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches and normalizes products from the brets.fr WordPress REST API", async () => {
    const raw = [
      {
        id: 8776,
        slug: "ail-confit-herbes-de-provence",
        title: { rendered: "Ail Confit &#038; Herbes de Provence" },
        acf: {
          packaging: {
            url: "https://cms.brets.fr/app/uploads/2026/06/ail-confit.png",
          },
        },
      },
    ];
    vi.mocked(fetch).mockResolvedValue(mockResponse(raw));

    const products = await fetchBretsProducts();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("https://cms.brets.fr/wp-json/wp/v2/product"),
    );
    expect(products).toEqual([
      {
        bretsId: 8776,
        slug: "ail-confit-herbes-de-provence",
        name: "Ail Confit & Herbes de Provence",
        image: "https://cms.brets.fr/app/uploads/2026/06/ail-confit.png",
      },
    ]);
  });

  it("paginates using the X-WP-TotalPages header until every page is fetched", async () => {
    const page1 = [{ id: 1, slug: "a", title: { rendered: "A" }, acf: { packaging: { url: "https://cms.brets.fr/a.png" } } }];
    const page2 = [{ id: 2, slug: "b", title: { rendered: "B" }, acf: { packaging: { url: "https://cms.brets.fr/b.png" } } }];

    vi.mocked(fetch)
      .mockResolvedValueOnce(mockResponse(page1, { "x-wp-totalpages": "2" }))
      .mockResolvedValueOnce(mockResponse(page2, { "x-wp-totalpages": "2" }));

    const products = await fetchBretsProducts();

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(products.map((p) => p.bretsId)).toEqual([1, 2]);
  });

  it("throws an exploitable error when the API responds with a non-2xx status", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      headers: new Headers(),
      json: async () => ({}),
    } as unknown as Response);

    await expect(fetchBretsProducts()).rejects.toThrow(/brets\.fr/i);
  });

  it("throws an exploitable error when a product is missing a packaging image", async () => {
    const raw = [
      {
        id: 1,
        slug: "sans-image",
        title: { rendered: "Sans Image" },
        acf: { packaging: null },
      },
    ];
    vi.mocked(fetch).mockResolvedValue(mockResponse(raw));

    await expect(fetchBretsProducts()).rejects.toThrow(/sans-image/i);
  });
});
