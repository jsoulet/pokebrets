import { describe, expect, it, vi } from "vitest";
import { runScrape } from "./scrape-catalogue";
import type { BretsProduct } from "./sources/brets";

describe("runScrape", () => {
  it("orchestrates fetch, merge, validation and write, returning a success summary", async () => {
    const bretsProducts: BretsProduct[] = [
      { bretsId: 1, slug: "curry-doux", name: "Curry Doux", image: "https://cms.brets.fr/curry.png" },
    ];
    const writeCatalogueFiles = vi.fn();

    const result = await runScrape({
      fetchBretsProducts: vi.fn().mockResolvedValue(bretsProducts),
      readPreviousCatalogue: vi.fn().mockReturnValue(null),
      readIdentityRegistry: vi.fn().mockReturnValue({}),
      writeCatalogueFiles,
    });

    expect(result.success).toBe(true);
    expect(writeCatalogueFiles).toHaveBeenCalledTimes(1);
    if (result.success) {
      expect(result.activeCount).toBe(1);
      expect(result.archivedCount).toBe(0);
      expect(result.mintedCount).toBe(1);
    }
  });

  it("never writes to disk when the built catalogue fails schema validation", async () => {
    const bretsProducts: BretsProduct[] = [
      { bretsId: 1, slug: "curry-doux", name: "Curry Doux", image: "https://cms.brets.fr/curry.png" },
      { bretsId: 2, slug: "curry-doux", name: "Curry Doux Bis", image: "https://cms.brets.fr/curry2.png" },
    ];
    const writeCatalogueFiles = vi.fn();

    const result = await runScrape({
      fetchBretsProducts: vi.fn().mockResolvedValue(bretsProducts),
      readPreviousCatalogue: vi.fn().mockReturnValue(null),
      readIdentityRegistry: vi.fn().mockReturnValue({}),
      writeCatalogueFiles,
    });

    expect(result.success).toBe(false);
    expect(writeCatalogueFiles).not.toHaveBeenCalled();
    if (!result.success) {
      expect(result.error.length).toBeGreaterThan(0);
    }
  });

  it("returns a failure without writing when fetching brets.fr rejects", async () => {
    const writeCatalogueFiles = vi.fn();

    const result = await runScrape({
      fetchBretsProducts: vi.fn().mockRejectedValue(new Error("network down")),
      readPreviousCatalogue: vi.fn().mockReturnValue(null),
      readIdentityRegistry: vi.fn().mockReturnValue({}),
      writeCatalogueFiles,
    });

    expect(result.success).toBe(false);
    expect(writeCatalogueFiles).not.toHaveBeenCalled();
    if (!result.success) {
      expect(result.error.join(" ")).toMatch(/network down/);
    }
  });

  it("returns a failure (never throws) without writing when reading existing state fails", async () => {
    const writeCatalogueFiles = vi.fn();
    const fetchBretsProducts = vi.fn();

    const result = await runScrape({
      fetchBretsProducts,
      readPreviousCatalogue: vi.fn().mockImplementation(() => {
        throw new Error("EACCES");
      }),
      readIdentityRegistry: vi.fn().mockReturnValue({}),
      writeCatalogueFiles,
    });

    expect(result.success).toBe(false);
    expect(fetchBretsProducts).not.toHaveBeenCalled();
    expect(writeCatalogueFiles).not.toHaveBeenCalled();
    if (!result.success) {
      expect(result.error.join(" ")).toMatch(/EACCES/);
    }
  });

  it("returns a failure (never throws) when the write to disk fails partway through", async () => {
    const bretsProducts: BretsProduct[] = [
      { bretsId: 1, slug: "curry-doux", name: "Curry Doux", image: "https://cms.brets.fr/curry.png" },
    ];

    const result = await runScrape({
      fetchBretsProducts: vi.fn().mockResolvedValue(bretsProducts),
      readPreviousCatalogue: vi.fn().mockReturnValue(null),
      readIdentityRegistry: vi.fn().mockReturnValue({}),
      writeCatalogueFiles: vi.fn().mockImplementation(() => {
        throw new Error("ENOSPC");
      }),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.join(" ")).toMatch(/ENOSPC/);
    }
  });

  it("counts archived flavors correctly in the summary", async () => {
    const bretsProducts: BretsProduct[] = [
      { bretsId: 1, slug: "curry-doux", name: "Curry Doux", image: "https://cms.brets.fr/curry.png" },
    ];
    const previousCatalogue = {
      generatedAt: "2026-01-01T00:00:00.000Z",
      flavors: [
        { id: "curry-doux", name: "Curry Doux", image: "https://cms.brets.fr/curry.png", status: "active" as const },
        { id: "poulet-basquaise", name: "Poulet Basquaise", image: "https://cms.brets.fr/poulet.png", status: "active" as const },
      ],
    };
    const writeCatalogueFiles = vi.fn();

    const result = await runScrape({
      fetchBretsProducts: vi.fn().mockResolvedValue(bretsProducts),
      readPreviousCatalogue: vi.fn().mockReturnValue(previousCatalogue),
      readIdentityRegistry: vi.fn().mockReturnValue({ "1": "curry-doux" }),
      writeCatalogueFiles,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.activeCount).toBe(1);
      expect(result.archivedCount).toBe(1);
      expect(result.mintedCount).toBe(0);
    }
  });
});
