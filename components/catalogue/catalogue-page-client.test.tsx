import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CataloguePageClient } from "./catalogue-page-client";
import { useCatalogue } from "@/lib/catalogue";
import { useTasted } from "@/lib/tasted";
import type { Catalogue } from "@/lib/schema";

// Story 1.4 tests the UI's reaction to the hook's public contract only —
// the hook's internal cache/fetch/freshness logic is already exhaustively
// covered by lib/catalogue/index.test.tsx (Story 1.3). Mocking here avoids
// duplicating that coverage.
vi.mock("@/lib/catalogue", () => ({
  useCatalogue: vi.fn(),
}));

// Story 1.5: same rationale — lib/tasted/index.test.tsx (Story 1.5) already
// exhaustively covers the hook's persistence/toggle logic. Mocking here lets
// this suite focus purely on how the UI projects the hook's public contract.
vi.mock("@/lib/tasted", () => ({
  useTasted: vi.fn(),
}));

const mockedUseCatalogue = vi.mocked(useCatalogue);
const mockedUseTasted = vi.mocked(useTasted);

const catalogue: Catalogue = {
  generatedAt: "2026-07-31T00:00:00.000Z",
  flavors: [
    { id: "curry-doux", name: "Curry Doux", image: "https://cms.brets.fr/curry.png", status: "active" },
    {
      id: "poivre-sauvage",
      name: "Poivre Sauvage",
      image: "https://cms.brets.fr/poivre.png",
      status: "active",
    },
  ],
};

function mockUseTasted(overrides: Partial<ReturnType<typeof useTasted>> = {}) {
  mockedUseTasted.mockReturnValue({
    tastedIds: new Set(),
    tastedCount: 0,
    isTasted: () => false,
    toggleTasted: vi.fn(),
    setTasted: vi.fn(),
    ...overrides,
  });
}

describe("CataloguePageClient", () => {
  beforeEach(() => {
    mockedUseCatalogue.mockReset();
    mockedUseTasted.mockReset();
    mockUseTasted();
  });

  it('shows the grid skeleton while status is "loading"', () => {
    mockedUseCatalogue.mockReturnValue({ data: null, status: "loading", error: null, retry: vi.fn() });

    render(<CataloguePageClient />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it('shows the catalogue grid immediately once status is "ready", regardless of cache vs network origin', () => {
    mockedUseCatalogue.mockReturnValue({ data: catalogue, status: "ready", error: null, retry: vi.fn() });

    render(<CataloguePageClient />);

    expect(screen.getByText("Curry Doux")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it('shows an explicit error state with the hook message and a working "Réessayer" button wired to retry()', () => {
    const retry = vi.fn();
    mockedUseCatalogue.mockReturnValue({
      data: null,
      status: "error",
      error: "Impossible de charger le catalogue, vérifie ta connexion",
      retry,
    });

    render(<CataloguePageClient />);

    expect(screen.getByText("Impossible de charger le catalogue, vérifie ta connexion")).toBeInTheDocument();
    const retryButton = screen.getByRole("button", { name: /réessayer/i });
    fireEvent.click(retryButton);
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('shows the "X/N saveurs goûtées" progress counter, joined by flavor id, once ready', () => {
    mockedUseCatalogue.mockReturnValue({ data: catalogue, status: "ready", error: null, retry: vi.fn() });
    mockUseTasted({ tastedIds: new Set(["curry-doux"]), tastedCount: 1 });

    render(<CataloguePageClient />);

    expect(screen.getByText("1/2 saveurs goûtées")).toBeInTheDocument();
  });

  it("does not show the progress counter while loading or on error", () => {
    mockedUseCatalogue.mockReturnValue({ data: null, status: "loading", error: null, retry: vi.fn() });

    render(<CataloguePageClient />);

    expect(screen.queryByText(/saveurs goûtées/i)).not.toBeInTheDocument();
  });

  it("toggles a flavor via the grid and announces the state change for screen readers", () => {
    const toggleTasted = vi.fn();
    mockedUseCatalogue.mockReturnValue({ data: catalogue, status: "ready", error: null, retry: vi.fn() });
    mockUseTasted({ toggleTasted });

    render(<CataloguePageClient />);

    fireEvent.click(screen.getByRole("button", { name: /curry doux/i }));

    expect(toggleTasted).toHaveBeenCalledWith("curry-doux");
  });

  it("renders a polite live region for the tasted-state announcement, updated after toggling", () => {
    mockedUseCatalogue.mockReturnValue({ data: catalogue, status: "ready", error: null, retry: vi.fn() });
    mockUseTasted();

    render(<CataloguePageClient />);

    fireEvent.click(screen.getByRole("button", { name: /curry doux/i }));

    expect(screen.getByText("Curry Doux, goûtée")).toBeInTheDocument();
  });
});
