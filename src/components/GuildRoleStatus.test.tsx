import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GuildRoleStatus } from "./GuildRoleStatus";

vi.mock("@/hooks/useTransactionStats", () => ({
  useTransactionStats: vi.fn(),
}));
vi.mock("@/hooks/useDeployedContracts", () => ({
  useDeployedContracts: vi.fn(),
}));
vi.mock("@/hooks/useBasename", () => ({
  useBasename: vi.fn(),
}));

import { useTransactionStats } from "@/hooks/useTransactionStats";
import { useDeployedContracts } from "@/hooks/useDeployedContracts";
import { useBasename } from "@/hooks/useBasename";

const mockTxStats = useTransactionStats as ReturnType<typeof vi.fn>;
const mockContracts = useDeployedContracts as ReturnType<typeof vi.fn>;
const mockBasename = useBasename as ReturnType<typeof vi.fn>;

function setup({
  txCount = 0,
  ethBalance = "0.0000",
  contractCount = 0,
  hasBasename = false,
} = {}) {
  mockTxStats.mockReturnValue({ txCount, ethBalance, isLoading: false, error: null, refetch: vi.fn() });
  mockContracts.mockReturnValue({ contracts: [], count: contractCount, isLoading: false, error: null, refetch: vi.fn() });
  mockBasename.mockReturnValue({ basename: hasBasename ? "alice.base.eth" : null, isLoading: false, hasBasename });
}

describe("GuildRoleStatus", () => {
  it("renders the heading", () => {
    setup();
    render(<GuildRoleStatus />);
    expect(screen.getByText("Guild Role Status")).toBeInTheDocument();
  });

  it("shows 0 / 9 unlocked when user has nothing", () => {
    setup();
    render(<GuildRoleStatus />);
    expect(screen.getByText("0 / 9 unlocked")).toBeInTheDocument();
  });

  it("shows Onchain role as achieved when balance >= 0.001 and txCount >= 1", () => {
    setup({ txCount: 1, ethBalance: "0.0010" });
    render(<GuildRoleStatus />);
    // Should show at least 1 unlocked
    expect(screen.getByText("1 / 9 unlocked")).toBeInTheDocument();
  });

  it("marks Based role achieved when user has a basename", () => {
    setup({ hasBasename: true });
    render(<GuildRoleStatus />);
    expect(screen.getByText("1 / 9 unlocked")).toBeInTheDocument();
  });

  it("marks contract deployment roles based on count", () => {
    setup({ contractCount: 5 });
    render(<GuildRoleStatus />);
    // Both "1 contract" and "5 contracts" should be achieved (2 roles)
    expect(screen.getByText("2 / 9 unlocked")).toBeInTheDocument();
  });

  it("shows all 9 role names", () => {
    setup();
    render(<GuildRoleStatus />);
    expect(screen.getByText("Based")).toBeInTheDocument();
    expect(screen.getByText("Onchain")).toBeInTheDocument();
    expect(screen.getByText("Based: 10 transactions")).toBeInTheDocument();
    expect(screen.getByText("Based: 1,000 transactions")).toBeInTheDocument();
    expect(screen.getByText("Builders & Founders (10+ contracts)")).toBeInTheDocument();
  });

  it("shows guild.xyz/base link", () => {
    setup();
    render(<GuildRoleStatus />);
    const link = screen.getByRole("link", { name: /guild.xyz\/base/i });
    expect(link).toHaveAttribute("href", "https://guild.xyz/base");
  });
});
