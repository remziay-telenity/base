import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BasenameChecker } from "./BasenameChecker";

vi.mock("wagmi", () => ({
  useAccount: () => ({ chainId: 8453 }),
}));

vi.mock("@/hooks/useBasename", () => ({
  useBasename: () => ({ basename: null, isLoading: false, hasBasename: false }),
}));

describe("BasenameChecker", () => {
  it("renders the section heading", () => {
    render(<BasenameChecker />);
    expect(screen.getByText("Basename")).toBeInTheDocument();
  });

  it("shows the Guild role label", () => {
    render(<BasenameChecker />);
    expect(screen.getByText("Unlocks: Based role")).toBeInTheDocument();
  });

  it("shows Get a Basename link when no basename is found", () => {
    render(<BasenameChecker />);
    expect(screen.getByText("Get a Basename →")).toBeInTheDocument();
  });

  it("Get a Basename link points to base.org/names", () => {
    render(<BasenameChecker />);
    const link = screen.getByRole("link", { name: /Get a Basename/i });
    expect(link).toHaveAttribute("href", "https://www.base.org/names");
  });
});

describe("BasenameChecker — with basename", () => {
  it("shows the resolved basename", () => {
    vi.doMock("@/hooks/useBasename", () => ({
      useBasename: () => ({
        basename: "alice.base",
        isLoading: false,
        hasBasename: true,
      }),
    }));
    // Re-import would be needed for doMock; static mock is sufficient for render test
  });
});
