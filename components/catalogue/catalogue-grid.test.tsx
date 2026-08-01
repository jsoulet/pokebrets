import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CatalogueGrid } from "./catalogue-grid";
import type { Flavor } from "@/lib/schema";

const flavors: Flavor[] = [
  { id: "curry-doux", name: "Curry Doux", image: "https://cms.brets.fr/curry.png", status: "active" },
  { id: "poivre-sauvage", name: "Poivre Sauvage", image: "https://cms.brets.fr/poivre.png", status: "archived" },
];

describe("CatalogueGrid", () => {
  it("renders one tile per flavor", () => {
    render(<CatalogueGrid flavors={flavors} tastedIds={new Set()} onToggleFlavor={vi.fn()} />);

    expect(screen.getByText("Curry Doux")).toBeInTheDocument();
    expect(screen.getByText("Poivre Sauvage")).toBeInTheDocument();
  });

  it("renders the exact number of tiles as flavors, regardless of dataset size", () => {
    render(<CatalogueGrid flavors={flavors} tastedIds={new Set()} onToggleFlavor={vi.fn()} />);

    expect(screen.getAllByRole("listitem")).toHaveLength(flavors.length);
  });

  it("marks tiles as tasted purely from the tastedIds set, without owning any storage logic", () => {
    render(
      <CatalogueGrid flavors={flavors} tastedIds={new Set(["curry-doux"])} onToggleFlavor={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: /curry doux/i })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: /poivre sauvage/i })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("forwards the flavor id to onToggleFlavor when a tile is toggled", () => {
    const onToggleFlavor = vi.fn();
    render(<CatalogueGrid flavors={flavors} tastedIds={new Set()} onToggleFlavor={onToggleFlavor} />);

    screen.getByRole("button", { name: /curry doux/i }).click();

    expect(onToggleFlavor).toHaveBeenCalledWith("curry-doux");
  });
});
