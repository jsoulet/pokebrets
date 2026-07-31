import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import Home from "./page";
import { useCatalogue } from "@/lib/catalogue";

// The hook's network/cache behavior is covered by lib/catalogue/index.test.tsx
// (Story 1.3); the grid/skeleton/error rendering per status is covered by
// components/catalogue/catalogue-page-client.test.tsx (Story 1.4). This
// smoke test only verifies the page shell renders and wires the Catalogue
// surface, without re-testing either.
vi.mock("@/lib/catalogue", () => ({
  useCatalogue: vi.fn(),
}));

const mockedUseCatalogue = vi.mocked(useCatalogue);

describe("Home page", () => {
  beforeEach(() => {
    mockedUseCatalogue.mockReset();
    mockedUseCatalogue.mockReturnValue({ data: null, status: "loading", error: null, retry: vi.fn() });
  });

  it("renders without crashing and displays the Crounch title", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: "Crounch" })).toBeInTheDocument();
  });

  it("renders the catalogue skeleton while the catalogue is loading", () => {
    render(<Home />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
