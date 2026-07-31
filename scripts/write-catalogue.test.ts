import { describe, expect, it, vi, beforeEach } from "vitest";
import { writeCatalogueFiles } from "./write-catalogue";
import type { Catalogue } from "../lib/schema";

const mkdirMock = vi.fn();
const writeFileMock = vi.fn();

vi.mock("node:fs", () => ({
  mkdirSync: (...args: unknown[]) => mkdirMock(...args),
  writeFileSync: (...args: unknown[]) => writeFileMock(...args),
  default: {
    mkdirSync: (...args: unknown[]) => mkdirMock(...args),
    writeFileSync: (...args: unknown[]) => writeFileMock(...args),
  },
}));

describe("writeCatalogueFiles", () => {
  beforeEach(() => {
    mkdirMock.mockReset();
    writeFileMock.mockReset();
  });

  it("creates data/ if needed and writes catalogue.json then the identity registry, in that order", () => {
    const catalogue: Catalogue = {
      generatedAt: "2026-07-31T00:00:00.000Z",
      flavors: [{ id: "curry-doux", name: "Curry Doux", image: "https://x/curry.png", status: "active" }],
    };
    const registry = { "1": "curry-doux" };

    writeCatalogueFiles({ catalogue, registry });

    expect(mkdirMock).toHaveBeenCalledWith(expect.stringContaining("data"), { recursive: true });
    expect(writeFileMock).toHaveBeenCalledTimes(2);

    const [catalogueCall, registryCall] = writeFileMock.mock.calls;
    expect(String(catalogueCall[0])).toContain("catalogue.json");
    expect(JSON.parse(catalogueCall[1] as string)).toEqual(catalogue);
    expect(String(registryCall[0])).toContain("identity-registry.json");
    expect(JSON.parse(registryCall[1] as string)).toEqual(registry);
  });
});
