import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TxHistory } from "./TxHistory";

vi.mock("wagmi", () => ({
  useAccount: () => ({ chainId: 8453 }),
}));

vi.mock("@/hooks/useTxHistory", () => ({
  useTxHistory: () => ({
    txs: [
      {
        hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
        from: "0xuser",
        to: "0xrecipient",
        contractAddress: "",
        blockNumber: "1000",
        timeStamp: String(Math.floor(Date.now() / 1000) - 300),
        isError: "0",
      },
      {
        hash: "0x1111111111111111111111111111111111111111111111111111111111111111",
        from: "0xuser",
        to: "0xother",
        contractAddress: "",
        blockNumber: "999",
        timeStamp: String(Math.floor(Date.now() / 1000) - 7200),
        isError: "1",
      },
    ],
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

describe("TxHistory — with API key", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_BASESCAN_API_KEY = "test-key";
  });

  it("renders the section heading", () => {
    render(<TxHistory />);
    expect(screen.getByText("Recent Transactions")).toBeInTheDocument();
  });

  it("renders transaction hashes in shortened form", () => {
    render(<TxHistory />);
    expect(screen.getByText("0xabcdef…567890")).toBeInTheDocument();
  });

  it("shows success badge for successful tx", () => {
    render(<TxHistory />);
    expect(screen.getByText("success")).toBeInTheDocument();
  });

  it("shows failed badge for errored tx", () => {
    render(<TxHistory />);
    expect(screen.getByText("failed")).toBeInTheDocument();
  });

  it("renders Basescan links for each tx", () => {
    render(<TxHistory />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(2);
    links.forEach((l) =>
      expect(l).toHaveAttribute("href", expect.stringContaining("basescan.org/tx/"))
    );
  });
});

describe("TxHistory — without API key", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_BASESCAN_API_KEY = "";
  });

  it("shows setup instructions when API key is missing", () => {
    render(<TxHistory />);
    expect(screen.getByText("Recent Transactions")).toBeInTheDocument();
    expect(screen.getByText(/NEXT_PUBLIC_BASESCAN_API_KEY/)).toBeInTheDocument();
  });
});
