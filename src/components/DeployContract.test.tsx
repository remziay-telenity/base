import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DeployContract } from "./DeployContract";

// --- wagmi mocks ---
const mockDeployContract = vi.fn();
vi.mock("wagmi", () => ({
  useAccount: () => ({ address: "0xuser", chainId: 8453 }),
  useDeployContract: () => ({
    deployContract: mockDeployContract,
    data: undefined,
    isPending: false,
    error: null,
  }),
  useWaitForTransactionReceipt: () => ({
    isLoading: false,
    isSuccess: false,
    data: undefined,
  }),
}));

vi.mock("@/hooks/useDeployedContracts", () => ({
  useDeployedContracts: () => ({
    contracts: [],
    count: 0,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
  CONTRACT_MILESTONES: [1, 5, 10],
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

import toast from "react-hot-toast";
const mockToast = toast as { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

describe("DeployContract", () => {
  beforeEach(() => {
    mockDeployContract.mockReset();
    mockToast.error.mockReset();
    mockToast.success.mockReset();
  });

  it("renders the heading", () => {
    render(<DeployContract />);
    expect(screen.getByText("Deploy a Smart Contract")).toBeInTheDocument();
  });

  it("renders 3 template buttons", () => {
    render(<DeployContract />);
    expect(screen.getByLabelText("Select Counter contract template")).toBeInTheDocument();
    expect(screen.getByLabelText("Select ERC-20 Token contract template")).toBeInTheDocument();
    expect(screen.getByLabelText("Select ERC-721 NFT contract template")).toBeInTheDocument();
  });

  it("counter template deploys without any extra fields", () => {
    render(<DeployContract />);
    const deployBtn = screen.getByRole("button", { name: /Deploy Counter/i });
    fireEvent.click(deployBtn);
    expect(mockDeployContract).toHaveBeenCalledTimes(1);
    expect(mockToast.error).not.toHaveBeenCalled();
  });

  it("token template shows required fields when selected", () => {
    render(<DeployContract />);
    fireEvent.click(screen.getByLabelText("Select ERC-20 Token contract template"));
    expect(screen.getByPlaceholderText("My Token")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("MTK")).toBeInTheDocument();
  });

  it("token template validates required fields — shows toast on empty name", () => {
    render(<DeployContract />);
    fireEvent.click(screen.getByLabelText("Select ERC-20 Token contract template"));
    fireEvent.click(screen.getByRole("button", { name: /Deploy ERC-20 Token/i }));
    expect(mockToast.error).toHaveBeenCalledWith("Token Name is required");
    expect(mockDeployContract).not.toHaveBeenCalled();
  });

  it("token template validates symbol field", () => {
    render(<DeployContract />);
    fireEvent.click(screen.getByLabelText("Select ERC-20 Token contract template"));
    fireEvent.change(screen.getByPlaceholderText("My Token"), {
      target: { value: "My Token" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Deploy ERC-20 Token/i }));
    expect(mockToast.error).toHaveBeenCalledWith("Symbol is required");
  });

  it("token template deploys when all required fields are filled", () => {
    render(<DeployContract />);
    fireEvent.click(screen.getByLabelText("Select ERC-20 Token contract template"));
    fireEvent.change(screen.getByPlaceholderText("My Token"), { target: { value: "Test Token" } });
    fireEvent.change(screen.getByPlaceholderText("MTK"), { target: { value: "TST" } });
    fireEvent.click(screen.getByRole("button", { name: /Deploy ERC-20 Token/i }));
    expect(mockDeployContract).toHaveBeenCalledTimes(1);
    expect(mockToast.error).not.toHaveBeenCalled();
  });

  it("nft template validates collection name", () => {
    render(<DeployContract />);
    fireEvent.click(screen.getByLabelText("Select ERC-721 NFT contract template"));
    fireEvent.click(screen.getByRole("button", { name: /Deploy ERC-721 NFT/i }));
    expect(mockToast.error).toHaveBeenCalledWith("Collection Name is required");
  });

  it("milestone list renders", () => {
    render(<DeployContract />);
    expect(screen.getByText("1 contract deployed")).toBeInTheDocument();
    expect(screen.getByText("5 contracts deployed")).toBeInTheDocument();
    expect(screen.getByText("10 contracts deployed")).toBeInTheDocument();
  });
});
