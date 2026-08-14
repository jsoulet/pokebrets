import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TastedFilterControl } from "./tasted-filter-control";

describe("TastedFilterControl", () => {
  it("renders all three filter options", () => {
    render(<TastedFilterControl value="all" onChange={() => {}} />);

    expect(screen.getByRole("button", { name: "Afficher toutes les Saveurs" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Afficher uniquement les Saveurs goûtées" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Afficher uniquement les Saveurs non goûtées" }),
    ).toBeInTheDocument();
  });

  it("marks the active mode as pressed", () => {
    render(<TastedFilterControl value="tasted" onChange={() => {}} />);

    expect(screen.getByRole("button", { name: /^afficher uniquement les saveurs goûtées$/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /toutes/i })).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.getByRole("button", { name: /^afficher uniquement les saveurs non goûtées$/i }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onChange with the newly selected mode", () => {
    const onChange = vi.fn();
    render(<TastedFilterControl value="all" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /^afficher uniquement les saveurs non goûtées$/i }));

    expect(onChange).toHaveBeenCalledWith("untasted");
  });

  it("does not call onChange when re-clicking the already-active mode", () => {
    const onChange = vi.fn();
    render(<TastedFilterControl value="all" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /toutes/i }));

    expect(onChange).not.toHaveBeenCalled();
  });
});
