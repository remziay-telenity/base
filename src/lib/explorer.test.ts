import { describe, it, expect } from "vitest";
import { explorerUrl, txUrl, addressUrl } from "./explorer";
import { base, baseSepolia } from "wagmi/chains";

describe("explorerUrl", () => {
  it("returns mainnet URL for Base mainnet chainId", () => {
    expect(explorerUrl(base.id)).toBe("https://basescan.org");
  });

  it("returns Sepolia URL for Base Sepolia chainId", () => {
    expect(explorerUrl(baseSepolia.id)).toBe("https://sepolia.basescan.org");
  });

  it("returns Sepolia URL for unknown chainId", () => {
    expect(explorerUrl(1)).toBe("https://sepolia.basescan.org");
  });

  it("returns Sepolia URL for undefined chainId", () => {
    expect(explorerUrl(undefined)).toBe("https://sepolia.basescan.org");
  });
});

describe("txUrl", () => {
  it("builds correct mainnet tx URL", () => {
    expect(txUrl(base.id, "0xabc")).toBe("https://basescan.org/tx/0xabc");
  });

  it("builds correct Sepolia tx URL", () => {
    expect(txUrl(baseSepolia.id, "0xdef")).toBe(
      "https://sepolia.basescan.org/tx/0xdef"
    );
  });
});

describe("addressUrl", () => {
  it("builds correct mainnet address URL", () => {
    expect(addressUrl(base.id, "0x123")).toBe(
      "https://basescan.org/address/0x123"
    );
  });

  it("builds correct Sepolia address URL", () => {
    expect(addressUrl(baseSepolia.id, "0x456")).toBe(
      "https://sepolia.basescan.org/address/0x456"
    );
  });
});
