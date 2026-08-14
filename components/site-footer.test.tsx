import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
  it("renders the non-commercial/fan-made disclaimer as a footer landmark", () => {
    render(<SiteFooter />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveTextContent(/non-commercial/i);
    expect(footer).toHaveTextContent(/Bret.s/);
  });
});
