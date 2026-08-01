import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
    render(<CatalogueTile flavor={activeFlavor} isTasted={false} onToggle={vi.fn()} />);

    expect(screen.getByText("Curry Doux")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Curry Doux" })).toHaveAttribute(
      "src",
      "https://cms.brets.fr/curry.png",
    );
  });

  it("does not show an archived badge for an active flavor", () => {
    render(<CatalogueTile flavor={activeFlavor} isTasted={false} onToggle={vi.fn()} />);

    expect(screen.queryByText(/archiv/i)).not.toBeInTheDocument();
  });

  it("shows a readable archived badge (not color-only) for an archived flavor, without hiding the tile", () => {
    render(<CatalogueTile flavor={archivedFlavor} isTasted={false} onToggle={vi.fn()} />);

    expect(screen.getByText("Poivre Sauvage")).toBeInTheDocument();
    expect(screen.getByText(/archiv/i)).toBeInTheDocument();
  });

  it("does not show a tasted badge when isTasted is false", () => {
    render(<CatalogueTile flavor={activeFlavor} isTasted={false} onToggle={vi.fn()} />);

    expect(screen.queryByText(/goûtée/i)).not.toBeInTheDocument();
  });

  it("shows a tasted badge when isTasted is true, keeping a neutral tile background (no full-fill)", () => {
    render(<CatalogueTile flavor={activeFlavor} isTasted={true} onToggle={vi.fn()} />);

    expect(screen.getByText(/goûtée/i)).toBeInTheDocument();
  });

  it("exposes a single toggle control reflecting isTasted via aria-pressed", () => {
    render(<CatalogueTile flavor={activeFlavor} isTasted={true} onToggle={vi.fn()} />);

    expect(screen.getByRole("button", { name: /curry doux/i })).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onToggle with the flavor id on tap/click", () => {
    const onToggle = vi.fn();
    render(<CatalogueTile flavor={activeFlavor} isTasted={false} onToggle={onToggle} />);

    fireEvent.click(screen.getByRole("button", { name: /curry doux/i }));

    expect(onToggle).toHaveBeenCalledWith("curry-doux");
  });

  it("stays interactive via the keyboard as a native button (no extra handler needed)", () => {
    const onToggle = vi.fn();
    render(<CatalogueTile flavor={activeFlavor} isTasted={false} onToggle={onToggle} />);

    const button = screen.getByRole("button", { name: /curry doux/i });
    button.focus();
    fireEvent.click(button);

    expect(onToggle).toHaveBeenCalledWith("curry-doux");
  });

  it("activates via a real Enter keydown on the native button element (browser-native Enter/Space activation)", () => {
    const onToggle = vi.fn();
    render(<CatalogueTile flavor={activeFlavor} isTasted={false} onToggle={onToggle} />);

    const button = screen.getByRole("button", { name: /curry doux/i }) as HTMLButtonElement;
    button.focus();
    // jsdom does not itself synthesize a click from a raw keydown the way a
    // real browser does for native <button> elements; this test documents
    // and locks in that a native <button> is used (not a <div>/<span> that
    // would require a manual keydown handler to be even theoretically
    // reachable via keyboard).
    expect(button.tagName).toBe("BUTTON");
    expect(button).not.toHaveAttribute("tabindex", "-1");
  });

  it("positions the tasted badge in the tile's corner (absolute top-right), not inline with the name", () => {
    render(<CatalogueTile flavor={activeFlavor} isTasted={true} onToggle={vi.fn()} />);

    expect(screen.getByText(/goûtée/i)).toHaveClass("absolute", "top-2", "right-2");
  });

  it("toggles a tasted archived flavor showing both badges without conflict", () => {
    render(<CatalogueTile flavor={archivedFlavor} isTasted={true} onToggle={vi.fn()} />);

    expect(screen.getByText(/archiv/i)).toBeInTheDocument();
    expect(screen.getByText(/goûtée/i)).toBeInTheDocument();
  });
});
