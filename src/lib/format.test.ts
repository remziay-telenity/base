import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { shortAddress, shortHash, timeAgo, formatEth, formatUsd, formatNumber } from "./format";

describe("shortAddress", () => {
  it("shortens a long address with default lengths", () => {
    const addr = "0x1234567890abcdef1234567890abcdef12345678";
    expect(shortAddress(addr)).toBe("0x1234…5678");
  });

  it("returns the address unchanged if it fits within prefix+suffix", () => {
    expect(shortAddress("0x1234", 6, 4)).toBe("0x1234");
  });

  it("uses custom prefix and suffix lengths", () => {
    const addr = "0xabcdef1234567890";
    expect(shortAddress(addr, 4, 4)).toBe("0xab…7890");
  });
});

describe("shortHash", () => {
  it("shortens a tx hash to prefix…suffix", () => {
    const hash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
    expect(shortHash(hash)).toBe("0xabcdef…567890");
  });
});

describe("timeAgo", () => {
  const now = 1_700_000_000;
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(now * 1000); });
  afterEach(() => { vi.useRealTimers(); });

  it("shows seconds", () => {
    expect(timeAgo(now - 30)).toBe("30s ago");
  });

  it("shows minutes", () => {
    expect(timeAgo(now - 120)).toBe("2m ago");
  });

  it("shows hours", () => {
    expect(timeAgo(now - 7200)).toBe("2h ago");
  });

  it("shows days", () => {
    expect(timeAgo(now - 86400 * 3)).toBe("3d ago");
  });

  it("accepts string timestamps", () => {
    expect(timeAgo(String(now - 60))).toBe("1m ago");
  });
});

describe("formatEth", () => {
  it("formats a number with 4 decimal places by default", () => {
    expect(formatEth(0.5)).toBe("0.5000 ETH");
  });

  it("formats a string input", () => {
    expect(formatEth("1.23456789")).toBe("1.2346 ETH");
  });

  it("supports custom decimal count", () => {
    expect(formatEth(1, 2)).toBe("1.00 ETH");
  });
});

describe("formatUsd", () => {
  it("formats dollars with 2 decimal places", () => {
    expect(formatUsd(1234.5)).toBe("$1,234.50");
  });

  it("formats zero", () => {
    expect(formatUsd(0)).toBe("$0.00");
  });
});

describe("formatNumber", () => {
  it("adds comma separators", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");
  });

  it("handles numbers under 1000", () => {
    expect(formatNumber(42)).toBe("42");
  });
});
