import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home page", () => {
  it("renders without crashing and displays the Crounch title", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: "Crounch" })).toBeInTheDocument();
  });
});
