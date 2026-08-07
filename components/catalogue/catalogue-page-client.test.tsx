import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { CataloguePageClient } from "./catalogue-page-client";
import { useCatalogue } from "@/lib/catalogue";
import { useTasted } from "@/lib/tasted";
import type { Catalogue } from "@/lib/schema";

// [Review] Cf. catalogue-tile.test.tsx : le nom accessible du bouton toggle
// peut chevaucher celui du bouton info depuis Story 1.6 ; seul le bouton
// toggle porte `aria-pressed`.
function getToggleButton(name: RegExp) {
  const button = screen
    .getAllByRole("button", { name })
    .find((candidate) => candidate.hasAttribute("aria-pressed"));
  if (!button) {
    throw new Error(`No toggle button found matching ${name}`);
  }
  return button;
}

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
    mockedUseCatalogue.mockReturnValue({ data: null, status: "loading", error: null, isOffline: false, retry: vi.fn() });

    render(<CataloguePageClient />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it('shows the catalogue grid immediately once status is "ready", regardless of cache vs network origin', () => {
    mockedUseCatalogue.mockReturnValue({ data: catalogue, status: "ready", error: null, isOffline: false, retry: vi.fn() });

    render(<CataloguePageClient />);

    expect(screen.getByText("Curry Doux")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it('does not show the offline banner when isOffline is false, even once ready', () => {
    mockedUseCatalogue.mockReturnValue({ data: catalogue, status: "ready", error: null, isOffline: false, retry: vi.fn() });

    render(<CataloguePageClient />);

    expect(screen.queryByText("Hors ligne — dernière version connue affichée")).not.toBeInTheDocument();
  });

  it('shows a discreet offline banner (AC #1) when status is "ready" and isOffline is true, cache still displayed', () => {
    mockedUseCatalogue.mockReturnValue({ data: catalogue, status: "ready", error: null, isOffline: true, retry: vi.fn() });

    render(<CataloguePageClient />);

    const banner = screen.getByText("Hors ligne — dernière version connue affichée");
    expect(banner).toBeInTheDocument();
    // Discreet, non-blocking status (AC #1: "restant utilisable normalement") — never role="alert".
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Curry Doux")).toBeInTheDocument();
  });

  it("keeps the toggle fully functional while the offline banner is displayed (AC #1 non-regression)", () => {
    const toggleTasted = vi.fn().mockReturnValue(true);
    mockedUseCatalogue.mockReturnValue({ data: catalogue, status: "ready", error: null, isOffline: true, retry: vi.fn() });
    mockUseTasted({ toggleTasted });

    render(<CataloguePageClient />);

    expect(screen.getByText("Hors ligne — dernière version connue affichée")).toBeInTheDocument();
    fireEvent.click(getToggleButton(/curry doux/i));

    expect(toggleTasted).toHaveBeenCalledWith("curry-doux");
  });

  it('shows an explicit error state with the hook message and a working "Réessayer" button wired to retry()', () => {
    const retry = vi.fn();
    mockedUseCatalogue.mockReturnValue({
      data: null,
      status: "error",
      error: "Impossible de charger le catalogue pour l'instant. Réessaie avec une connexion.",
      isOffline: false,
      retry,
    });

    render(<CataloguePageClient />);

    expect(
      screen.getByText("Impossible de charger le catalogue pour l'instant. Réessaie avec une connexion."),
    ).toBeInTheDocument();
    const retryButton = screen.getByRole("button", { name: /réessayer/i });
    fireEvent.click(retryButton);
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('shows the "X/N saveurs goûtées" progress counter, joined by flavor id, once ready', () => {
    mockedUseCatalogue.mockReturnValue({ data: catalogue, status: "ready", error: null, isOffline: false, retry: vi.fn() });
    mockUseTasted({ tastedIds: new Set(["curry-doux"]), tastedCount: 1 });

    render(<CataloguePageClient />);

    expect(screen.getByText("1/2 saveurs goûtées")).toBeInTheDocument();
  });

  it("does not show the progress counter while loading", () => {
    mockedUseCatalogue.mockReturnValue({ data: null, status: "loading", error: null, isOffline: false, retry: vi.fn() });

    render(<CataloguePageClient />);

    expect(screen.queryByText(/saveurs goûtées/i)).not.toBeInTheDocument();
  });

  it("does not show the progress counter on error", () => {
    mockedUseCatalogue.mockReturnValue({
      data: null,
      status: "error",
      error: "Impossible de charger le catalogue pour l'instant. Réessaie avec une connexion.",
      isOffline: false,
      retry: vi.fn(),
    });

    render(<CataloguePageClient />);

    expect(screen.queryByText(/saveurs goûtées/i)).not.toBeInTheDocument();
  });

  it("never inflates the counter with persisted ids that no longer exist in the current catalogue (orphan ids)", () => {
    mockedUseCatalogue.mockReturnValue({ data: catalogue, status: "ready", error: null, isOffline: false, retry: vi.fn() });
    // tastedCount (raw hook count) intentionally diverges from tastedIds to
    // prove the page joins against `data.flavors` by id rather than trusting
    // the hook's own count, which could include ids for flavors removed from
    // a since-updated catalogue.
    mockUseTasted({
      tastedIds: new Set(["curry-doux", "orphan-flavor-no-longer-in-catalogue"]),
      tastedCount: 2,
    });

    render(<CataloguePageClient />);

    expect(screen.getByText("1/2 saveurs goûtées")).toBeInTheDocument();
  });

  it("toggles a flavor via the grid and announces the state change for screen readers", () => {
    const toggleTasted = vi.fn().mockReturnValue(true);
    mockedUseCatalogue.mockReturnValue({ data: catalogue, status: "ready", error: null, isOffline: false, retry: vi.fn() });
    mockUseTasted({ toggleTasted });

    render(<CataloguePageClient />);

    fireEvent.click(getToggleButton(/curry doux/i));

    expect(toggleTasted).toHaveBeenCalledWith("curry-doux");
  });

  it('renders a polite live region announcing "goûtée" when toggleTasted resolves to tasted', () => {
    mockedUseCatalogue.mockReturnValue({ data: catalogue, status: "ready", error: null, isOffline: false, retry: vi.fn() });
    mockUseTasted({ toggleTasted: vi.fn().mockReturnValue(true) });

    render(<CataloguePageClient />);

    fireEvent.click(getToggleButton(/curry doux/i));

    const liveRegion = screen.getByText("Curry Doux, goûtée");
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
  });

  it('renders a polite live region announcing "pas goûtée" when toggleTasted resolves to un-tasted', () => {
    mockedUseCatalogue.mockReturnValue({ data: catalogue, status: "ready", error: null, isOffline: false, retry: vi.fn() });
    mockUseTasted({ toggleTasted: vi.fn().mockReturnValue(false) });

    render(<CataloguePageClient />);

    fireEvent.click(getToggleButton(/curry doux/i));

    const liveRegion = screen.getByText("Curry Doux, pas goûtée");
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveAttribute("aria-live", "polite");
  });

  it("bases the announcement on toggleTasted's returned next state, not on the pre-click tastedIds snapshot", () => {
    // Regression test: the announcement must never be derived by
    // re-deriving `!tastedIds.has(id)` from the hook's render-time snapshot,
    // since that snapshot can be stale on rapid repeated toggles. It must
    // use the boolean returned synchronously by toggleTasted() itself.
    mockedUseCatalogue.mockReturnValue({ data: catalogue, status: "ready", error: null, isOffline: false, retry: vi.fn() });
    // tastedIds already contains curry-doux (as if a stale/prior render),
    // yet toggleTasted() authoritatively resolves to "tasted" (true) for
    // this call — the announcement must follow the return value, not flip
    // the opposite way by re-reading tastedIds.
    mockUseTasted({
      tastedIds: new Set(["curry-doux"]),
      toggleTasted: vi.fn().mockReturnValue(true),
    });

    render(<CataloguePageClient />);

    fireEvent.click(getToggleButton(/curry doux/i));

    expect(screen.getByText("Curry Doux, goûtée")).toBeInTheDocument();
  });

  it("does not render a detail dialog before any info button is activated", () => {
    mockedUseCatalogue.mockReturnValue({ data: catalogue, status: "ready", error: null, isOffline: false, retry: vi.fn() });

    render(<CataloguePageClient />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens the flavor detail dialog for the corresponding flavor when its info button is activated", () => {
    mockedUseCatalogue.mockReturnValue({ data: catalogue, status: "ready", error: null, isOffline: false, retry: vi.fn() });

    render(<CataloguePageClient />);

    const infoButtons = screen.getAllByRole("button", { name: /détail|info/i });
    fireEvent.click(infoButtons[0]);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText("Curry Doux")).toBeInTheDocument();
  });

  it("toggles the flavor from within the dialog using the same coordination function as the tile, and announces it", () => {
    const toggleTasted = vi.fn().mockReturnValue(true);
    mockedUseCatalogue.mockReturnValue({ data: catalogue, status: "ready", error: null, isOffline: false, retry: vi.fn() });
    mockUseTasted({ toggleTasted });

    render(<CataloguePageClient />);

    fireEvent.click(screen.getAllByRole("button", { name: /détail|info/i })[0]);
    fireEvent.click(screen.getByRole("button", { name: /marquer comme goûtée/i }));

    expect(toggleTasted).toHaveBeenCalledWith("curry-doux");
    expect(screen.getByText("Curry Doux, goûtée")).toBeInTheDocument();
  });

  it("closes the dialog on Escape without mutating the tasted state", () => {
    const toggleTasted = vi.fn();
    mockedUseCatalogue.mockReturnValue({ data: catalogue, status: "ready", error: null, isOffline: false, retry: vi.fn() });
    mockUseTasted({ toggleTasted });

    render(<CataloguePageClient />);

    fireEvent.click(screen.getAllByRole("button", { name: /détail|info/i })[0]);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(toggleTasted).not.toHaveBeenCalled();
  });

  it("returns focus to the info button that opened the dialog after it closes", async () => {
    mockedUseCatalogue.mockReturnValue({ data: catalogue, status: "ready", error: null, isOffline: false, retry: vi.fn() });

    render(<CataloguePageClient />);

    const infoButton = screen.getAllByRole("button", { name: /détail|info/i })[0];
    fireEvent.click(infoButton);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await waitFor(() => expect(document.activeElement).toBe(infoButton));
  });
});
