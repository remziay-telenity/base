import { describe, it, expect } from "vitest";
import {
  milestoneProgress,
  nextMilestone,
  TX_MILESTONES,
} from "./useTransactionStats";

describe("TX_MILESTONES", () => {
  it("contains the correct milestone values", () => {
    expect(TX_MILESTONES).toEqual([1, 10, 50, 100, 1000]);
  });
});

describe("nextMilestone", () => {
  it("returns 1 when count is 0", () => {
    expect(nextMilestone(0)).toBe(1);
  });

  it("returns 10 when count is 1", () => {
    expect(nextMilestone(1)).toBe(10);
  });

  it("returns 50 when count is 10", () => {
    expect(nextMilestone(10)).toBe(50);
  });

  it("returns 100 when count is 49", () => {
    expect(nextMilestone(49)).toBe(50);
  });

  it("returns 1000 when count is 100", () => {
    expect(nextMilestone(100)).toBe(1000);
  });

  it("returns 1000 when count exceeds all milestones", () => {
    expect(nextMilestone(5000)).toBe(1000);
  });
});

describe("milestoneProgress", () => {
  it("returns 0 when count is 0", () => {
    expect(milestoneProgress(0)).toBe(0);
  });

  it("returns 100 when count meets or exceeds 1000", () => {
    expect(milestoneProgress(1000)).toBe(100);
    expect(milestoneProgress(9999)).toBe(100);
  });

  it("returns 50 when halfway to next milestone from 0→10 (count=5)", () => {
    // prev=1, next=10, count=5 → (5-1)/(10-1) ≈ 44%
    expect(milestoneProgress(5)).toBeGreaterThan(0);
    expect(milestoneProgress(5)).toBeLessThan(100);
  });

  it("returns a value between 0 and 100 for any mid-range count", () => {
    const result = milestoneProgress(55);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });

  it("returns a higher progress for higher count within the same range", () => {
    expect(milestoneProgress(90)).toBeGreaterThan(milestoneProgress(60));
  });
});
