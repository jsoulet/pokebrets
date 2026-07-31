import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CatalogueGrid } from "./catalogue-grid";
import type { Flavor } from "@/lib/schema";

const flavors: Flavor[] = [
  { id: "curry-doux", name: "Curry Doux", image: "https://cms.brets.fr/curry.png", status: "active" },
  { id: "poivre-sauvage", name: "Poivre Sauvage", image: "https://cms.brets.fr/poivre.png", status: "archived" },
];

describe("CatalogueGrid", () => {
  it("renders one tile per flavor", () => {
    render(<CatalogueGrid flavors={flavors} />);

    expect(screen.getByText("Curry Doux")).toBeInTheDocument();
    expect(screen.getByText("Poivre Sauvage")).toBeInTheDocument();
  });

  it("renders the exact number of tiles as flavors, regardless of dataset size", () => {
    render(<CatalogueGrid flavors={flavors} />);

    expect(screen.getAllByRole("img")).toHaveLength(flavors.length);
  });
});
