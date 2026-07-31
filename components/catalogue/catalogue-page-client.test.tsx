import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CataloguePageClient } from "./catalogue-page-client";
import { useCatalogue } from "@/lib/catalogue";
import type { Catalogue } from "@/lib/schema";

// Story 1.4 tests the UI's reaction to the hook's public contract only —
// the hook's internal cache/fetch/freshness logic is already exhaustively
// covered by lib/catalogue/index.test.tsx (Story 1.3). Mocking here avoids
// duplicating that coverage.
vi.mock("@/lib/catalogue", () => ({
  useCatalogue: vi.fn(),
}));

const mockedUseCatalogue = vi.mocked(useCatalogue);

const catalogue: Catalogue = {
  generatedAt: "2026-07-31T00:00:00.000Z",
  flavors: [
    { id: "curry-doux", name: "Curry Doux", image: "https://cms.brets.fr/curry.png", status: "active" },
  ],
};

describe("CataloguePageClient", () => {
  beforeEach(() => {
    mockedUseCatalogue.mockReset();
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
});
