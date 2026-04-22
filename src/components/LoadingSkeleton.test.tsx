import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton, SkeletonText, SkeletonCard } from "./LoadingSkeleton";

describe("Skeleton", () => {
  it("renders with animate-pulse class", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass("animate-pulse");
  });

  it("merges additional className", () => {
    const { container } = render(<Skeleton className="h-4 w-32" />);
    expect(container.firstChild).toHaveClass("h-4", "w-32");
  });
});

describe("SkeletonText", () => {
  it("renders the correct number of lines", () => {
    const { container } = render(<SkeletonText lines={3} />);
    const lines = container.querySelectorAll(".animate-pulse");
    expect(lines).toHaveLength(3);
  });

  it("defaults to 1 line", () => {
    const { container } = render(<SkeletonText />);
    const lines = container.querySelectorAll(".animate-pulse");
    expect(lines).toHaveLength(1);
  });

  it("last line is narrower when multiple lines", () => {
    const { container } = render(<SkeletonText lines={2} />);
    const lines = container.querySelectorAll(".animate-pulse");
    expect(lines[lines.length - 1]).toHaveClass("w-3/4");
  });
});

describe("SkeletonCard", () => {
  it("renders without crashing", () => {
    const { container } = render(<SkeletonCard />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("contains multiple skeleton elements", () => {
    const { container } = render(<SkeletonCard />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(3);
  });
});
