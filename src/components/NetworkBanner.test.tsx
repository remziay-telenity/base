import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NetworkBanner } from "./NetworkBanner";

const mockSwitchChain = vi.fn();

vi.mock("wagmi", () => ({
  useAccount: vi.fn(),
  useSwitchChain: () => ({ switchChain: mockSwitchChain }),
}));

import { useAccount } from "wagmi";

describe("NetworkBanner — disconnected", () => {
  it("renders nothing when wallet is not connected", () => {
    (useAccount as ReturnType<typeof vi.fn>).mockReturnValue({ isConnected: false, chainId: undefined });
    const { container } = render(<NetworkBanner />);
    expect(container.firstChild).toBeNull();
  });
});

describe("NetworkBanner — Base Mainnet", () => {
  it("shows Base Mainnet label", () => {
    (useAccount as ReturnType<typeof vi.fn>).mockReturnValue({ isConnected: true, chainId: 8453 });
    render(<NetworkBanner />);
    expect(screen.getByText(/Base Mainnet/)).toBeInTheDocument();
  });

  it("offers a switch to Sepolia button", () => {
    (useAccount as ReturnType<typeof vi.fn>).mockReturnValue({ isConnected: true, chainId: 8453 });
    render(<NetworkBanner />);
    expect(screen.getByText(/switch to Sepolia/i)).toBeInTheDocument();
  });
});

describe("NetworkBanner — Base Sepolia", () => {
  it("shows Base Sepolia Testnet label", () => {
    (useAccount as ReturnType<typeof vi.fn>).mockReturnValue({ isConnected: true, chainId: 84532 });
    render(<NetworkBanner />);
    expect(screen.getByText(/Base Sepolia Testnet/)).toBeInTheDocument();
  });

  it("offers a switch to Base Mainnet button", () => {
    (useAccount as ReturnType<typeof vi.fn>).mockReturnValue({ isConnected: true, chainId: 84532 });
    render(<NetworkBanner />);
    expect(screen.getByText(/switch to Base Mainnet/i)).toBeInTheDocument();
  });
});

describe("NetworkBanner — unsupported network", () => {
  it("shows unsupported network message", () => {
    (useAccount as ReturnType<typeof vi.fn>).mockReturnValue({ isConnected: true, chainId: 1 });
    render(<NetworkBanner />);
    expect(screen.getByText(/Unsupported network/i)).toBeInTheDocument();
  });
});
