import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SendTransaction } from "./SendTransaction";

const mockSendTransaction = vi.fn();

vi.mock("wagmi", () => ({
  useAccount: () => ({ address: "0xUserAddress1234567890", chainId: 8453 }),
  useSendTransaction: () => ({
    sendTransaction: mockSendTransaction,
    data: undefined,
    isPending: false,
  }),
  useWaitForTransactionReceipt: () => ({
    isLoading: false,
    isSuccess: false,
  }),
}));

vi.mock("@/hooks/useTransactionStats", () => ({
  useTransactionStats: () => ({
    txCount: 7,
    ethBalance: "0.1234",
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

import toast from "react-hot-toast";
const mockToast = toast as { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

describe("SendTransaction", () => {
  beforeEach(() => {
    mockSendTransaction.mockReset();
    mockToast.error.mockReset();
    mockToast.success.mockReset();
  });

  it("renders the heading", () => {
    render(<SendTransaction />);
    expect(screen.getByText("Send a Transaction")).toBeInTheDocument();
  });

  it("shows the current tx count from stats", () => {
    render(<SendTransaction />);
    expect(screen.getByText(/7 txs so far/)).toBeInTheDocument();
  });

  it("renders recipient and amount inputs", () => {
    render(<SendTransaction />);
    expect(screen.getByPlaceholderText("0x...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("0.0001")).toBeInTheDocument();
  });

  it("'use my address' button fills recipient field", () => {
    render(<SendTransaction />);
    fireEvent.click(screen.getByLabelText("Use my wallet address as recipient"));
    expect(screen.getByPlaceholderText("0x...")).toHaveValue("0xUserAddress1234567890");
  });

  it("shows inline error for invalid address and does not call sendTransaction", () => {
    render(<SendTransaction />);
    fireEvent.change(screen.getByPlaceholderText("0x..."), {
      target: { value: "not-an-address" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send Transaction" }));
    expect(screen.getByText("Invalid recipient address")).toBeInTheDocument();
    expect(mockSendTransaction).not.toHaveBeenCalled();
    expect(mockToast.error).toHaveBeenCalledWith("Invalid recipient address");
  });

  it("calls sendTransaction with valid address", () => {
    render(<SendTransaction />);
    const validAddr = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
    fireEvent.change(screen.getByPlaceholderText("0x..."), {
      target: { value: validAddr },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send Transaction" }));
    expect(mockSendTransaction).toHaveBeenCalledTimes(1);
    expect(mockToast.error).not.toHaveBeenCalled();
  });

  it("Send Transaction button is rendered", () => {
    render(<SendTransaction />);
    expect(screen.getByRole("button", { name: "Send Transaction" })).toBeInTheDocument();
  });
});
