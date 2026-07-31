import { describe, expect, it, vi, beforeEach } from "vitest";
import { writeCatalogueFiles } from "./write-catalogue";
import type { Catalogue } from "../lib/schema";

const mkdirMock = vi.fn();
const writeFileMock = vi.fn();
const renameMock = vi.fn();

vi.mock("node:fs", () => ({
  mkdirSync: (...args: unknown[]) => mkdirMock(...args),
  writeFileSync: (...args: unknown[]) => writeFileMock(...args),
  renameSync: (...args: unknown[]) => renameMock(...args),
  default: {
    mkdirSync: (...args: unknown[]) => mkdirMock(...args),
    writeFileSync: (...args: unknown[]) => writeFileMock(...args),
    renameSync: (...args: unknown[]) => renameMock(...args),
  },
}));

describe("writeCatalogueFiles", () => {
  beforeEach(() => {
    mkdirMock.mockReset();
    writeFileMock.mockReset();
    renameMock.mockReset();
  });

  const catalogue: Catalogue = {
    generatedAt: "2026-07-31T00:00:00.000Z",
    flavors: [{ id: "curry-doux", name: "Curry Doux", image: "https://x/curry.png", status: "active" }],
  };
  const registry = { "1": "curry-doux" };

  it("creates data/ if needed, writes both files to temp paths, then renames them atomically into place", () => {
    writeCatalogueFiles({ catalogue, registry });

    expect(mkdirMock).toHaveBeenCalledWith(expect.stringContaining("data"), { recursive: true });

    // Les deux écritures physiques se font sur des fichiers temporaires —
    // aucune écriture directe de catalogue.json / identity-registry.json —
    // pour ne jamais laisser un fichier final tronqué (AD-7, Subtask 4.3/6.3).
    expect(writeFileMock).toHaveBeenCalledTimes(2);
    for (const call of writeFileMock.mock.calls) {
      expect(String(call[0])).toMatch(/\.tmp-\d+/);
    }
    const [catalogueWriteCall, registryWriteCall] = writeFileMock.mock.calls;
    expect(String(catalogueWriteCall[0])).toContain("catalogue.json");
    expect(JSON.parse(catalogueWriteCall[1] as string)).toEqual(catalogue);
    expect(String(registryWriteCall[0])).toContain("identity-registry.json");
    expect(JSON.parse(registryWriteCall[1] as string)).toEqual(registry);

    // Les deux écritures temporaires ont réussi avant tout renommage : seul
    // le renommage (atomique sur un même système de fichiers) touche les
    // fichiers finaux, et dans l'ordre catalogue.json puis registre.
    expect(renameMock).toHaveBeenCalledTimes(2);
    expect(String(renameMock.mock.calls[0][1])).toContain("catalogue.json");
    expect(String(renameMock.mock.calls[1][1])).toContain("identity-registry.json");
  });

  it("never renames any file into place if writing either temp file fails", () => {
    writeFileMock.mockImplementationOnce(() => {
      throw new Error("ENOSPC");
    });

    expect(() => writeCatalogueFiles({ catalogue, registry })).toThrow(/ENOSPC/);
    expect(renameMock).not.toHaveBeenCalled();
  });
});
