import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoleCard } from "./RoleCard";

const defaultProps = {
  name: "Onchain",
  description: "Hold ≥0.001 ETH AND have ≥1 transaction on Base",
  category: "Home",
  categoryColor: "bg-blue-900 text-blue-300",
};

describe("RoleCard", () => {
  it("renders the role name", () => {
    render(<RoleCard {...defaultProps} />);
    expect(screen.getByText("Onchain")).toBeInTheDocument();
  });

  it("renders the role description", () => {
    render(<RoleCard {...defaultProps} />);
    expect(
      screen.getByText("Hold ≥0.001 ETH AND have ≥1 transaction on Base")
    ).toBeInTheDocument();
  });

  it("renders the category badge", () => {
    render(<RoleCard {...defaultProps} />);
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("does not show checkmark when not completed", () => {
    const { container } = render(<RoleCard {...defaultProps} />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeInTheDocument();
  });

  it("shows checkmark when completed is true", () => {
    const { container } = render(<RoleCard {...defaultProps} completed />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("applies green border styling when completed", () => {
    const { container } = render(<RoleCard {...defaultProps} completed />);
    expect(container.firstChild).toHaveClass("border-green-800");
  });

  it("applies default border styling when not completed", () => {
    const { container } = render(<RoleCard {...defaultProps} />);
    expect(container.firstChild).toHaveClass("border-[#222]");
  });
});
