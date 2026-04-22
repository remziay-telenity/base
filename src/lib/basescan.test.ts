import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchTxList, fetchDeployedContracts } from "./basescan";
import { base, baseSepolia } from "wagmi/chains";

const MOCK_ADDRESS = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
const MOCK_API_KEY = "test-api-key";

const mockTxList = [
  {
    hash: "0xabc",
    from: MOCK_ADDRESS.toLowerCase(),
    to: "0x1234",
    contractAddress: "",
    blockNumber: "1000",
    timeStamp: "1700000000",
    isError: "0",
  },
  {
    hash: "0xdef",
    from: MOCK_ADDRESS.toLowerCase(),
    to: "",
    contractAddress: "0x9999",
    blockNumber: "1001",
    timeStamp: "1700000001",
    isError: "0",
  },
];

describe("fetchTxList", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({ status: "1", result: mockTxList }),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls the Base mainnet API for chainId 8453", async () => {
    await fetchTxList(MOCK_ADDRESS, base.id, MOCK_API_KEY);
    const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(url).toContain("api.basescan.org");
    expect(url).not.toContain("sepolia");
  });

  it("calls the Sepolia API for chainId 84532", async () => {
    await fetchTxList(MOCK_ADDRESS, baseSepolia.id, MOCK_API_KEY);
    const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(url).toContain("api-sepolia.basescan.org");
  });

  it("includes address and apikey in the request URL", async () => {
    await fetchTxList(MOCK_ADDRESS, base.id, MOCK_API_KEY);
    const url = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(url).toContain(MOCK_ADDRESS);
    expect(url).toContain(MOCK_API_KEY);
  });

  it("returns an array of transactions", async () => {
    const result = await fetchTxList(MOCK_ADDRESS, base.id, MOCK_API_KEY);
    expect(result).toHaveLength(2);
    expect(result[0].hash).toBe("0xabc");
  });

  it("returns empty array when API reports no transactions", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      json: async () => ({ status: "0", message: "No transactions found", result: [] }),
    });
    const result = await fetchTxList(MOCK_ADDRESS, base.id, MOCK_API_KEY);
    expect(result).toEqual([]);
  });

  it("throws on API error status", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      json: async () => ({ status: "0", message: "Invalid API Key" }),
    });
    await expect(fetchTxList(MOCK_ADDRESS, base.id, MOCK_API_KEY)).rejects.toThrow(
      "Invalid API Key"
    );
  });
});

describe("fetchDeployedContracts", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({ status: "1", result: mockTxList }),
      })
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns only contract creation transactions", async () => {
    const result = await fetchDeployedContracts(MOCK_ADDRESS, base.id, MOCK_API_KEY);
    expect(result).toHaveLength(1);
    expect(result[0].contractAddress).toBe("0x9999");
  });

  it("returns empty array when no contracts were deployed", async () => {
    const noContracts = mockTxList.filter((tx) => tx.to !== "");
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      json: async () => ({ status: "1", result: noContracts }),
    });
    const result = await fetchDeployedContracts(MOCK_ADDRESS, base.id, MOCK_API_KEY);
    expect(result).toHaveLength(0);
  });
});
