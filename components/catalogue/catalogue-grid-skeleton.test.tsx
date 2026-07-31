import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CatalogueGridSkeleton } from "./catalogue-grid-skeleton";

describe("CatalogueGridSkeleton", () => {
  it("renders a grid of placeholder tiles announced as loading", () => {
    render(<CatalogueGridSkeleton />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
