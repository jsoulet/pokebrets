import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UntastedFilterToggle } from "./untasted-filter-toggle";

describe("UntastedFilterToggle", () => {
  it("renders a toggle button with an explicit visible label", () => {
    render(<UntastedFilterToggle checked={false} onCheckedChange={() => {}} />);

    expect(screen.getByRole("button", { name: "Non goûtées uniquement" })).toBeInTheDocument();
  });

  it("reflects the checked state via aria-pressed", () => {
    render(<UntastedFilterToggle checked={true} onCheckedChange={() => {}} />);

    expect(screen.getByRole("button", { name: "Non goûtées uniquement" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("calls onCheckedChange with the toggled value", () => {
    const onCheckedChange = vi.fn();
    render(<UntastedFilterToggle checked={false} onCheckedChange={onCheckedChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Non goûtées uniquement" }));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});
