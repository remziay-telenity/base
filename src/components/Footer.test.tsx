import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "./Footer";

describe("Footer", () => {
  it("renders the guild.xyz link", () => {
    render(<Footer />);
    expect(screen.getByText("guild.xyz/base")).toBeInTheDocument();
  });

  it("renders the Basescan link", () => {
    render(<Footer />);
    expect(screen.getByText("Basescan")).toBeInTheDocument();
  });

  it("renders the Base Docs link", () => {
    render(<Footer />);
    expect(screen.getByText("Base Docs")).toBeInTheDocument();
  });

  it("renders the GitHub link", () => {
    render(<Footer />);
    expect(screen.getByText(/Open source on GitHub/i)).toBeInTheDocument();
  });

  it("all links open in a new tab", () => {
    render(<Footer />);
    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      expect(link).toHaveAttribute("target", "_blank");
    });
  });

  it("GitHub link points to the correct repo", () => {
    render(<Footer />);
    const ghLink = screen.getByRole("link", { name: /Open source on GitHub/i });
    expect(ghLink).toHaveAttribute("href", "https://github.com/remziay/base");
  });
});
