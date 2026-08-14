import { useRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FlavorDetailDialog } from "./flavor-detail-dialog";
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

describe("FlavorDetailDialog", () => {
  it("renders nothing accessible when open is false", () => {
    render(
      <FlavorDetailDialog
        flavor={activeFlavor}
        open={false}
        onOpenChange={vi.fn()}
        isTasted={false}
        onToggle={vi.fn()}
        rating={undefined}
        onRatingChange={vi.fn()}
      />,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the enlarged visual, name and status inside a real dialog role when open", () => {
    render(
      <FlavorDetailDialog
        flavor={activeFlavor}
        open={true}
        onOpenChange={vi.fn()}
        isTasted={false}
        onToggle={vi.fn()}
        rating={undefined}
        onRatingChange={vi.fn()}
      />,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Curry Doux" })).toBeInTheDocument();
    expect(screen.getByText("Curry Doux")).toBeInTheDocument();
    expect(screen.getByText(/^active$/i)).toBeInTheDocument();
  });

  it("shows the archived status textually (not color-only) for an archived flavor", () => {
    render(
      <FlavorDetailDialog
        flavor={archivedFlavor}
        open={true}
        onOpenChange={vi.fn()}
        isTasted={false}
        onToggle={vi.fn()}
        rating={undefined}
        onRatingChange={vi.fn()}
      />,
    );

    expect(screen.getByText(/n'est plus produite/i)).toBeInTheDocument();
  });

  it("renders a toggle button reflecting isTasted state", () => {
    render(
      <FlavorDetailDialog
        flavor={activeFlavor}
        open={true}
        onOpenChange={vi.fn()}
        isTasted={true}
        onToggle={vi.fn()}
        rating={undefined}
        onRatingChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /pas goûtée/i })).toBeInTheDocument();
  });

  it("renders a toggle button offering to mark as tasted when not yet tasted", () => {
    render(
      <FlavorDetailDialog
        flavor={activeFlavor}
        open={true}
        onOpenChange={vi.fn()}
        isTasted={false}
        onToggle={vi.fn()}
        rating={undefined}
        onRatingChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /marquer comme goûtée/i })).toBeInTheDocument();
  });

  it("calls onToggle with the flavor id when the toggle button is activated, and never opens/closes on its own", () => {
    const onToggle = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <FlavorDetailDialog
        flavor={activeFlavor}
        open={true}
        onOpenChange={onOpenChange}
        isTasted={false}
        onToggle={onToggle}
        rating={undefined}
        onRatingChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /marquer comme goûtée/i }));

    expect(onToggle).toHaveBeenCalledWith("curry-doux");
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("closes without calling onToggle when Escape is pressed", () => {
    const onToggle = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <FlavorDetailDialog
        flavor={activeFlavor}
        open={true}
        onOpenChange={onOpenChange}
        isTasted={false}
        onToggle={onToggle}
        rating={undefined}
        onRatingChange={vi.fn()}
      />,
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("closes without calling onToggle when clicking outside the dialog (backdrop)", () => {
    const onToggle = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <FlavorDetailDialog
        flavor={activeFlavor}
        open={true}
        onOpenChange={onOpenChange}
        isTasted={false}
        onToggle={onToggle}
        rating={undefined}
        onRatingChange={vi.fn()}
      />,
    );

    fireEvent.mouseDown(document.body);
    fireEvent.mouseUp(document.body);
    fireEvent.click(document.body);

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("exposes an explicit close control in addition to Escape/outside-click", () => {
    const onOpenChange = vi.fn();
    render(
      <FlavorDetailDialog
        flavor={activeFlavor}
        open={true}
        onOpenChange={onOpenChange}
        isTasted={false}
        onToggle={vi.fn()}
        rating={undefined}
        onRatingChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /fermer/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("returns focus to the connected element referenced by finalFocusRef when closed via Escape", async () => {
    function Wrapper() {
      const triggerRef = useRef<HTMLButtonElement | null>(null);
      const [open, setOpen] = useState(true);
      return (
        <>
          <button ref={triggerRef} type="button">
            Trigger
          </button>
          <FlavorDetailDialog
            flavor={activeFlavor}
            open={open}
            onOpenChange={setOpen}
            isTasted={false}
            onToggle={vi.fn()}
            rating={undefined}
            onRatingChange={vi.fn()}
            finalFocusRef={triggerRef}
          />
        </>
      );
    }
    render(<Wrapper />);

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "Trigger" })),
    );
  });

  it("does not throw and skips focus restoration when finalFocusRef points to a disconnected node at close time", async () => {
    function Wrapper() {
      const triggerRef = useRef<HTMLButtonElement | null>(null);
      const [open, setOpen] = useState(true);
      const [showTrigger, setShowTrigger] = useState(true);
      return (
        <>
          {showTrigger ? (
            <button ref={triggerRef} type="button">
              Trigger
            </button>
          ) : null}
          <button type="button" onClick={() => setShowTrigger(false)}>
            Unmount trigger
          </button>
          <FlavorDetailDialog
            flavor={activeFlavor}
            open={open}
            onOpenChange={setOpen}
            isTasted={false}
            onToggle={vi.fn()}
            rating={undefined}
            onRatingChange={vi.fn()}
            finalFocusRef={triggerRef}
          />
        </>
      );
    }
    render(<Wrapper />);

    fireEvent.click(screen.getByRole("button", { name: "Unmount trigger", hidden: true }));
    expect(() => fireEvent.keyDown(document, { key: "Escape" })).not.toThrow();
  });
});
