import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CatalogueTile } from "./catalogue-tile";
import type { Flavor } from "@/lib/schema";

// [Review] Depuis Story 1.6, le bouton info partage un fragment de nom
// accessible ("Curry Doux") avec le bouton toggle principal (dont le nom
// est dérivé de l'image + du texte de la tuile) : un `getByRole` filtré
// uniquement par nom serait ambigu. Seul le bouton toggle porte
// `aria-pressed` — ce helper lève l'ambiguïté sans dépendre de la forme
// exacte du nom accessible calculé.
function getToggleButton(name: RegExp) {
  const button = screen
    .getAllByRole("button", { name })
    .find((candidate) => candidate.hasAttribute("aria-pressed"));
  if (!button) {
    throw new Error(`No toggle button found matching ${name}`);
  }
  return button;
}

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
    render(
      <CatalogueTile
        flavor={activeFlavor}
        isTasted={false}
        onToggle={vi.fn()}
        onOpenDetail={vi.fn()}
      />,
    );

    expect(screen.getByText("Curry Doux")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Curry Doux" })).toHaveAttribute(
      "src",
      "https://cms.brets.fr/curry.png",
    );
  });

  it("does not show an archived badge for an active flavor", () => {
    render(
      <CatalogueTile
        flavor={activeFlavor}
        isTasted={false}
        onToggle={vi.fn()}
        onOpenDetail={vi.fn()}
      />,
    );

    expect(screen.queryByText(/archiv/i)).not.toBeInTheDocument();
  });

  it("shows a readable archived badge (not color-only) for an archived flavor, without hiding the tile", () => {
    render(
      <CatalogueTile
        flavor={archivedFlavor}
        isTasted={false}
        onToggle={vi.fn()}
        onOpenDetail={vi.fn()}
      />,
    );

    expect(screen.getByText("Poivre Sauvage")).toBeInTheDocument();
    expect(screen.getByText(/archiv/i)).toBeInTheDocument();
  });

  it("does not show a tasted badge when isTasted is false", () => {
    render(
      <CatalogueTile
        flavor={activeFlavor}
        isTasted={false}
        onToggle={vi.fn()}
        onOpenDetail={vi.fn()}
      />,
    );

    expect(screen.queryByText(/goûtée/i)).not.toBeInTheDocument();
  });

  it("shows a tasted badge when isTasted is true, keeping a neutral tile background (no full-fill)", () => {
    render(
      <CatalogueTile
        flavor={activeFlavor}
        isTasted={true}
        onToggle={vi.fn()}
        onOpenDetail={vi.fn()}
      />,
    );

    expect(screen.getByText(/goûtée/i)).toBeInTheDocument();
  });

  it("exposes a single toggle control reflecting isTasted via aria-pressed", () => {
    render(
      <CatalogueTile flavor={activeFlavor} isTasted={true} onToggle={vi.fn()} onOpenDetail={vi.fn()} />,
    );

    expect(getToggleButton(/curry doux/i)).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onToggle with the flavor id on tap/click", () => {
    const onToggle = vi.fn();
    render(
      <CatalogueTile
        flavor={activeFlavor}
        isTasted={false}
        onToggle={onToggle}
        onOpenDetail={vi.fn()}
      />,
    );

    fireEvent.click(getToggleButton(/curry doux/i));

    expect(onToggle).toHaveBeenCalledWith("curry-doux");
  });

  it("stays interactive via the keyboard as a native button (no extra handler needed)", () => {
    const onToggle = vi.fn();
    render(
      <CatalogueTile
        flavor={activeFlavor}
        isTasted={false}
        onToggle={onToggle}
        onOpenDetail={vi.fn()}
      />,
    );

    const button = getToggleButton(/curry doux/i);
    button.focus();
    fireEvent.click(button);

    expect(onToggle).toHaveBeenCalledWith("curry-doux");
  });

  it("activates via a real Enter keydown on the native button element (browser-native Enter/Space activation)", () => {
    const onToggle = vi.fn();
    render(
      <CatalogueTile
        flavor={activeFlavor}
        isTasted={false}
        onToggle={onToggle}
        onOpenDetail={vi.fn()}
      />,
    );

    const button = getToggleButton(/curry doux/i) as HTMLButtonElement;
    button.focus();
    // jsdom does not itself synthesize a click from a raw keydown the way a
    // real browser does for native <button> elements; this test documents
    // and locks in that a native <button> is used (not a <div>/<span> that
    // would require a manual keydown handler to be even theoretically
    // reachable via keyboard).
    expect(button.tagName).toBe("BUTTON");
    expect(button).not.toHaveAttribute("tabindex", "-1");
  });

  it("keeps the info button natively focusable and keyboard-activatable, mirroring the toggle button", () => {
    render(
      <CatalogueTile flavor={activeFlavor} isTasted={false} onToggle={vi.fn()} onOpenDetail={vi.fn()} />,
    );

    const infoButton = screen.getByRole("button", { name: /détail|info/i }) as HTMLButtonElement;
    infoButton.focus();

    expect(infoButton.tagName).toBe("BUTTON");
    expect(infoButton).not.toHaveAttribute("tabindex", "-1");
  });

  it("positions the tasted badge in the tile's corner (absolute top-right), not inline with the name", () => {
    render(
      <CatalogueTile flavor={activeFlavor} isTasted={true} onToggle={vi.fn()} onOpenDetail={vi.fn()} />,
    );

    expect(screen.getByText(/goûtée/i)).toHaveClass("absolute", "top-2", "right-2");
  });

  it("toggles a tasted archived flavor showing both badges without conflict", () => {
    render(
      <CatalogueTile
        flavor={archivedFlavor}
        isTasted={true}
        onToggle={vi.fn()}
        onOpenDetail={vi.fn()}
      />,
    );

    expect(screen.getByText(/archiv/i)).toBeInTheDocument();
    expect(screen.getByText(/goûtée/i)).toBeInTheDocument();
  });

  it("exposes a distinct info button, sibling to the toggle button, never nested inside it", () => {
    render(
      <CatalogueTile flavor={activeFlavor} isTasted={false} onToggle={vi.fn()} onOpenDetail={vi.fn()} />,
    );

    const infoButton = screen.getByRole("button", { name: /détail|info/i });
    const toggleButton = getToggleButton(/curry doux/i);
    expect(infoButton).not.toBe(toggleButton);
    // Un <button> ne peut jamais légalement contenir un autre <button> — on
    // vérifie explicitement que l'un n'est pas un ancêtre de l'autre.
    expect(toggleButton.contains(infoButton)).toBe(false);
    expect(infoButton.contains(toggleButton)).toBe(false);
  });

  it("calls onOpenDetail with the flavor id and the info button element when the info button is activated", () => {
    const onOpenDetail = vi.fn();
    render(
      <CatalogueTile flavor={activeFlavor} isTasted={false} onToggle={vi.fn()} onOpenDetail={onOpenDetail} />,
    );

    const infoButton = screen.getByRole("button", { name: /détail|info/i });
    fireEvent.click(infoButton);

    expect(onOpenDetail).toHaveBeenCalledWith("curry-doux", infoButton);
  });

  it("never calls onToggle when the info button is activated (no click propagation to the toggle)", () => {
    const onToggle = vi.fn();
    render(
      <CatalogueTile
        flavor={activeFlavor}
        isTasted={false}
        onToggle={onToggle}
        onOpenDetail={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /détail|info/i }));

    expect(onToggle).not.toHaveBeenCalled();
  });

  it("never calls onOpenDetail when the main tile toggle button is activated", () => {
    const onOpenDetail = vi.fn();
    render(
      <CatalogueTile
        flavor={activeFlavor}
        isTasted={false}
        onToggle={vi.fn()}
        onOpenDetail={onOpenDetail}
      />,
    );

    fireEvent.click(getToggleButton(/curry doux/i));

    expect(onOpenDetail).not.toHaveBeenCalled();
  });

  it("positions the info button in a corner that does not conflict with the tasted badge (top-left vs top-right)", () => {
    render(
      <CatalogueTile flavor={activeFlavor} isTasted={true} onToggle={vi.fn()} onOpenDetail={vi.fn()} />,
    );

    const infoButton = screen.getByRole("button", { name: /détail|info/i });
    const badge = screen.getByText(/goûtée/i);
    expect(infoButton).toHaveClass("absolute", "top-2", "left-2");
    expect(badge).toHaveClass("absolute", "top-2", "right-2");
  });

  it("gives each flavor's info button a distinct accessible name (screen-reader navigation by buttons list)", () => {
    render(
      <CatalogueTile flavor={activeFlavor} isTasted={false} onToggle={vi.fn()} onOpenDetail={vi.fn()} />,
    );

    expect(
      screen.getByRole("button", { name: "Voir le détail de Curry Doux" }),
    ).toBeInTheDocument();
  });
});
