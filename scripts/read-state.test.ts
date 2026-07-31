import { describe, expect, it, vi, beforeEach } from "vitest";

const existsSyncMock = vi.fn();
const readFileSyncMock = vi.fn();

vi.mock("node:fs", () => ({
  existsSync: (...args: unknown[]) => existsSyncMock(...args),
  readFileSync: (...args: unknown[]) => readFileSyncMock(...args),
  default: {
    existsSync: (...args: unknown[]) => existsSyncMock(...args),
    readFileSync: (...args: unknown[]) => readFileSyncMock(...args),
  },
}));

describe("readPreviousCatalogue", () => {
  beforeEach(() => {
    existsSyncMock.mockReset();
    readFileSyncMock.mockReset();
  });

  it("returns null when data/catalogue.json does not exist yet", async () => {
    const { readPreviousCatalogue } = await import("./read-state");
    existsSyncMock.mockReturnValue(false);

    expect(readPreviousCatalogue()).toBeNull();
  });

  it("returns the parsed catalogue when the file exists and is valid", async () => {
    const { readPreviousCatalogue } = await import("./read-state");
    const catalogue = {
      generatedAt: "2026-07-30T00:00:00.000Z",
      flavors: [{ id: "curry-doux", name: "Curry Doux", image: "https://x/curry.png", status: "active" }],
    };
    existsSyncMock.mockReturnValue(true);
    readFileSyncMock.mockReturnValue(JSON.stringify(catalogue));

    expect(readPreviousCatalogue()).toEqual(catalogue);
  });

  it("returns null (never throws) when the existing file is corrupted or invalid against the schema", async () => {
    const { readPreviousCatalogue } = await import("./read-state");
    existsSyncMock.mockReturnValue(true);
    readFileSyncMock.mockReturnValue("{ not valid json");

    expect(() => readPreviousCatalogue()).not.toThrow();
    expect(readPreviousCatalogue()).toBeNull();
  });
});

describe("readIdentityRegistry", () => {
  beforeEach(() => {
    existsSyncMock.mockReset();
    readFileSyncMock.mockReset();
  });

  it("returns an empty registry when the file does not exist yet", async () => {
    const { readIdentityRegistry } = await import("./read-state");
    existsSyncMock.mockReturnValue(false);

    expect(readIdentityRegistry()).toEqual({});
  });

  it("returns the parsed registry when the file exists", async () => {
    const { readIdentityRegistry } = await import("./read-state");
    existsSyncMock.mockReturnValue(true);
    readFileSyncMock.mockReturnValue(JSON.stringify({ "1": "curry-doux" }));

    expect(readIdentityRegistry()).toEqual({ "1": "curry-doux" });
  });
});
