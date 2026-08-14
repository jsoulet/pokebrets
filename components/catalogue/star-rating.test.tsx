import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StarRating } from "./star-rating";

describe("StarRating", () => {
  it("renders 5 individually focusable star buttons with explicit aria-labels", () => {
    render(<StarRating value={undefined} onChange={() => {}} />);

    for (let n = 1; n <= 5; n++) {
      expect(
        screen.getByRole("button", { name: `Noter ${n} étoile${n > 1 ? "s" : ""} sur 5` }),
      ).toBeInTheDocument();
    }
  });

  it("shows no star pre-selected when value is undefined", () => {
    render(<StarRating value={undefined} onChange={() => {}} />);

    for (let n = 1; n <= 5; n++) {
      expect(
        screen.getByRole("button", { name: `Noter ${n} étoile${n > 1 ? "s" : ""} sur 5` }),
      ).toHaveAttribute("aria-pressed", "false");
    }
  });

  it("marks the star matching the current value as pressed", () => {
    render(<StarRating value={3} onChange={() => {}} />);

    expect(screen.getByRole("button", { name: "Noter 3 étoiles sur 5" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Noter 4 étoiles sur 5" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("calls onChange with the tapped value when tapping a different star", () => {
    const onChange = vi.fn();
    render(<StarRating value={2} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Noter 4 étoiles sur 5" }));

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("calls onChange with null when re-tapping the star matching the current rating", () => {
    const onChange = vi.fn();
    render(<StarRating value={4} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Noter 4 étoiles sur 5" }));

    expect(onChange).toHaveBeenCalledWith(null);
  });
});
