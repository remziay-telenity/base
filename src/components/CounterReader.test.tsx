import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CounterReader } from "./CounterReader";

const mockRefetch = vi.fn();

vi.mock("wagmi", () => ({
  useAccount: () => ({ address: "0xUser", chainId: 8453 }),
}));

vi.mock("@/hooks/useReadContract", () => ({
  useReadContract: vi.fn(),
}));

import { useReadContract } from "@/hooks/useReadContract";
const mockHook = useReadContract as ReturnType<typeof vi.fn>;

describe("CounterReader", () => {
  it("renders the heading", () => {
    mockHook.mockReturnValue({ data: null, isLoading: false, error: null, refetch: mockRefetch });
    render(<CounterReader />);
    expect(screen.getByText("Read Counter Value")).toBeInTheDocument();
  });

  it("renders address input and Read button", () => {
    mockHook.mockReturnValue({ data: null, isLoading: false, error: null, refetch: mockRefetch });
    render(<CounterReader />);
    expect(screen.getByLabelText("Counter contract address for reading")).toBeInTheDocument();
    expect(screen.getByLabelText("Read counter value")).toBeInTheDocument();
  });

  it("displays the counter value when data is available", () => {
    mockHook.mockReturnValue({ data: 42n, isLoading: false, error: null, refetch: mockRefetch });
    render(<CounterReader />);
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Current count")).toBeInTheDocument();
  });

  it("shows error message on read failure", () => {
    mockHook.mockReturnValue({ data: null, isLoading: false, error: "revert: not allowed", refetch: mockRefetch });
    render(<CounterReader />);
    expect(screen.getByText("revert: not allowed")).toBeInTheDocument();
  });

  it("Read button calls refetch when clicked", () => {
    // Input needs a valid address for the button to be enabled
    mockHook.mockReturnValue({ data: null, isLoading: false, error: null, refetch: mockRefetch });
    render(<CounterReader />);
    const input = screen.getByLabelText("Counter contract address for reading");
    fireEvent.change(input, { target: { value: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" } });
    const btn = screen.getByLabelText("Read counter value");
    fireEvent.click(btn);
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });
});
