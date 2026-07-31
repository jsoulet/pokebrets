import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CatalogueTile } from "./catalogue-tile";
import type { Flavor } from "@/lib/schema";

const activeFlavor: Flavor = {
  id: "curry-doux",
  name: "Curry Doux",
  image: "https://cms.brets.fr/curry.png",
  status: "active",
};

const archivedFlavor: Flavor = {
  id: "poivre-sauvage",
  name: "Poivre Sauvage",
  image: "https://cms.brets.fr/poivre.png",
  status: "archived",
};

describe("CatalogueTile", () => {
  it("renders the flavor name and image with an accessible alt text", () => {
    render(<CatalogueTile flavor={activeFlavor} />);

    expect(screen.getByText("Curry Doux")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Curry Doux" })).toHaveAttribute(
      "src",
      "https://cms.brets.fr/curry.png",
    );
  });

  it("does not show an archived badge for an active flavor", () => {
    render(<CatalogueTile flavor={activeFlavor} />);

    expect(screen.queryByText(/archiv/i)).not.toBeInTheDocument();
  });

  it("shows a readable archived badge (not color-only) for an archived flavor, without hiding the tile", () => {
    render(<CatalogueTile flavor={archivedFlavor} />);

    expect(screen.getByText("Poivre Sauvage")).toBeInTheDocument();
    expect(screen.getByText(/archiv/i)).toBeInTheDocument();
  });
});
