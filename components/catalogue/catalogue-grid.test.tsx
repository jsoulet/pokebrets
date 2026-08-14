import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CatalogueGrid } from "./catalogue-grid";
import type { Flavor } from "@/lib/schema";

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

const flavors: Flavor[] = [
  { id: "curry-doux", name: "Curry Doux", image: "https://cms.brets.fr/curry.png", status: "active" },
  { id: "poivre-sauvage", name: "Poivre Sauvage", image: "https://cms.brets.fr/poivre.png", status: "archived" },
];

describe("CatalogueGrid", () => {
  it("renders one tile per flavor", () => {
    render(
      <CatalogueGrid
        flavors={flavors}
        tastedIds={new Set()}
        getRating={() => undefined}
        onToggleFlavor={vi.fn()}
        onOpenFlavorDetail={vi.fn()}
      />,
    );

    expect(screen.getByText("Curry Doux")).toBeInTheDocument();
    expect(screen.getByText("Poivre Sauvage")).toBeInTheDocument();
  });

  it("renders the exact number of tiles as flavors, regardless of dataset size", () => {
    render(
      <CatalogueGrid
        flavors={flavors}
        tastedIds={new Set()}
        getRating={() => undefined}
        onToggleFlavor={vi.fn()}
        onOpenFlavorDetail={vi.fn()}
      />,
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(flavors.length);
  });

  it("marks tiles as tasted purely from the tastedIds set, without owning any storage logic", () => {
    render(
      <CatalogueGrid
        flavors={flavors}
        tastedIds={new Set(["curry-doux"])}
        getRating={() => undefined}
        onToggleFlavor={vi.fn()}
        onOpenFlavorDetail={vi.fn()}
      />,
    );

    expect(getToggleButton(/curry doux/i)).toHaveAttribute("aria-pressed", "true");
    expect(getToggleButton(/poivre sauvage/i)).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("forwards the flavor id to onToggleFlavor when a tile is toggled", () => {
    const onToggleFlavor = vi.fn();
    render(
      <CatalogueGrid
        flavors={flavors}
        tastedIds={new Set()}
        getRating={() => undefined}
        onToggleFlavor={onToggleFlavor}
        onOpenFlavorDetail={vi.fn()}
      />,
    );

    getToggleButton(/curry doux/i).click();

    expect(onToggleFlavor).toHaveBeenCalledWith("curry-doux");
  });

  it("forwards the flavor id and the info button element to onOpenFlavorDetail when a tile's info button is activated", () => {
    const onOpenFlavorDetail = vi.fn();
    render(
      <CatalogueGrid
        flavors={flavors}
        tastedIds={new Set()}
        getRating={() => undefined}
        onToggleFlavor={vi.fn()}
        onOpenFlavorDetail={onOpenFlavorDetail}
      />,
    );

    const infoButton = screen.getAllByRole("button", { name: /détail|info/i })[0];
    infoButton.click();

    expect(onOpenFlavorDetail).toHaveBeenCalledWith("curry-doux", infoButton);
  });

  it("relays each flavor's rating (via getRating, joined by id) to its tile as a star badge", () => {
    render(
      <CatalogueGrid
        flavors={flavors}
        tastedIds={new Set()}
        getRating={(id) => (id === "curry-doux" ? 4 : undefined)}
        onToggleFlavor={vi.fn()}
        onOpenFlavorDetail={vi.fn()}
      />,
    );

    expect(screen.getByText("★ 4")).toBeInTheDocument();
  });
});
