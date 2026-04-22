import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TxProgressBar } from "./TxProgressBar";

describe("TxProgressBar", () => {
  it("shows milestone label and incomplete state when count is below milestone", () => {
    render(
      <TxProgressBar count={3} milestone={10} prevMilestone={1} />
    );
    expect(screen.getByText("10 transactions")).toBeInTheDocument();
    expect(screen.getByText("3/10")).toBeInTheDocument();
  });

  it("shows complete state when count meets the milestone", () => {
    render(
      <TxProgressBar count={10} milestone={10} prevMilestone={1} />
    );
    expect(screen.getByText("complete")).toBeInTheDocument();
  });

  it("shows complete state when count exceeds the milestone", () => {
    render(
      <TxProgressBar count={55} milestone={10} prevMilestone={1} />
    );
    expect(screen.getByText("complete")).toBeInTheDocument();
  });

  it("renders a progress bar element", () => {
    const { container } = render(
      <TxProgressBar count={5} milestone={100} prevMilestone={10} />
    );
    const bar = container.querySelector(".h-1\\.5");
    expect(bar).toBeInTheDocument();
  });

  it("applies green colour class when milestone is met", () => {
    const { container } = render(
      <TxProgressBar count={100} milestone={100} prevMilestone={50} />
    );
    const fill = container.querySelector(".bg-green-500");
    expect(fill).toBeInTheDocument();
  });

  it("applies blue colour class when milestone is not yet met", () => {
    const { container } = render(
      <TxProgressBar count={20} milestone={100} prevMilestone={10} />
    );
    const fill = container.querySelector(".bg-blue-500");
    expect(fill).toBeInTheDocument();
  });
});
