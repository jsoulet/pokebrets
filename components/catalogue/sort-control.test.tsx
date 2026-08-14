import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SortControl } from "./sort-control";

describe("SortControl", () => {
  it("renders both sort mode options", () => {
    render(<SortControl value="alphabetical" onChange={() => {}} />);

    expect(screen.getByRole("button", { name: /alphabétique/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /note/i })).toBeInTheDocument();
  });

  it("marks the active mode as pressed", () => {
    render(<SortControl value="rating" onChange={() => {}} />);

    expect(screen.getByRole("button", { name: /par note/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: /alphabétique/i })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("calls onChange with the newly selected mode", () => {
    const onChange = vi.fn();
    render(<SortControl value="alphabetical" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /par note/i }));

    expect(onChange).toHaveBeenCalledWith("rating");
  });

  it("does not call onChange when re-clicking the already-active mode", () => {
    const onChange = vi.fn();
    render(<SortControl value="alphabetical" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /alphabétique/i }));

    expect(onChange).not.toHaveBeenCalled();
  });
});
