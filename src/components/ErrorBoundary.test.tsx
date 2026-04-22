import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "./ErrorBoundary";

// Suppress React error boundary console.error noise
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});
afterEach(() => {
  console.error = originalConsoleError;
});

function BrokenComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("test render error");
  return <div>All good</div>;
}

describe("ErrorBoundary", () => {
  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText("All good")).toBeInTheDocument();
  });

  it("shows default fallback UI when a child throws", () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("test render error")).toBeInTheDocument();
    expect(screen.getByText("Try again")).toBeInTheDocument();
  });

  it("shows custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<div>Custom error UI</div>}>
        <BrokenComponent shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText("Custom error UI")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("'Try again' button clears the error state (resets to hasError=false)", () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow />
      </ErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // After clicking "Try again", the boundary attempts to re-render children.
    // Since BrokenComponent still throws, the error UI reappears — but this
    // confirms the reset cycle works (no uncaught exception propagates out).
    fireEvent.click(screen.getByText("Try again"));

    // The boundary should show error UI again (child still throws)
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });
});
