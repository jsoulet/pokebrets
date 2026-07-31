import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { fetchOffProducts } from "./off";

describe("fetchOffProducts", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches and normalizes Brets-branded products from Open Food Facts", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        count: 1,
        page: 1,
        page_count: 1,
        products: [
          {
            code: "3497917000907",
            product_name: "Chips saveur fromage du Jura",
            image_url: "https://images.openfoodfacts.org/images/products/349/791/700/0907/front_fr.222.400.jpg",
            brands: "Brets",
          },
        ],
      }),
    } as unknown as Response);

    const products = await fetchOffProducts();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("https://world.openfoodfacts.org/api/v2/search"),
    );
    expect(products).toEqual([
      {
        code: "3497917000907",
        name: "Chips saveur fromage du Jura",
        image: "https://images.openfoodfacts.org/images/products/349/791/700/0907/front_fr.222.400.jpg",
      },
    ]);
  });

  it("paginates across page_count pages", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          count: 2,
          page: 1,
          page_count: 2,
          products: [{ code: "1", product_name: "A", image_url: "https://x/a.jpg", brands: "Brets" }],
        }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          count: 2,
          page: 2,
          page_count: 2,
          products: [{ code: "2", product_name: "B", image_url: "https://x/b.jpg", brands: "Brets" }],
        }),
      } as unknown as Response);

    const products = await fetchOffProducts();

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(products.map((p) => p.code)).toEqual(["1", "2"]);
  });

  it("skips a product missing a usable name or image instead of throwing", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        count: 2,
        page: 1,
        page_count: 1,
        products: [
          { code: "1", product_name: "", image_url: "https://x/a.jpg", brands: "Brets" },
          { code: "2", product_name: "Valid", image_url: "https://x/b.jpg", brands: "Brets" },
        ],
      }),
    } as unknown as Response);

    const products = await fetchOffProducts();

    expect(products).toEqual([{ code: "2", name: "Valid", image: "https://x/b.jpg" }]);
  });

  it("throws an exploitable error when the API responds with a non-2xx status", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({}),
    } as unknown as Response);

    await expect(fetchOffProducts()).rejects.toThrow(/open food facts/i);
  });
});

describe("resolveOffMatch", () => {
  it("returns the OFF product only when the bretsId is explicitly listed in the matching table", async () => {
    const { resolveOffMatch } = await import("./off");
    const offProducts = [{ code: "3497917000907", name: "Chips saveur fromage du Jura", image: "https://x/jura.jpg" }];
    const table = { "8776": "3497917000907" };

    expect(resolveOffMatch(8776, table, offProducts)).toEqual(offProducts[0]);
  });

  it("returns null when the bretsId has no entry in the matching table", async () => {
    const { resolveOffMatch } = await import("./off");
    const offProducts = [{ code: "3497917000907", name: "Chips saveur fromage du Jura", image: "https://x/jura.jpg" }];

    expect(resolveOffMatch(1, {}, offProducts)).toBeNull();
  });

  it("returns null when the matching table references a code absent from the fetched OFF products", async () => {
    const { resolveOffMatch } = await import("./off");
    expect(resolveOffMatch(8776, { "8776": "unknown-code" }, [])).toBeNull();
  });
});
