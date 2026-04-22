import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("returns the initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("hello", 300));
    expect(result.current).toBe("hello");
  });

  it("does not update before delayMs elapses", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } }
    );
    rerender({ value: "b" });
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe("a");
  });

  it("updates after delayMs elapses", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } }
    );
    rerender({ value: "b" });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe("b");
  });

  it("resets the timer on rapid updates — only applies the last value", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: "a" } }
    );
    rerender({ value: "b" });
    act(() => { vi.advanceTimersByTime(100); });
    rerender({ value: "c" });
    act(() => { vi.advanceTimersByTime(100); });
    rerender({ value: "d" });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe("d");
  });

  it("works with numeric values", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 0 } }
    );
    rerender({ value: 99 });
    act(() => { vi.advanceTimersByTime(500); });
    expect(result.current).toBe(99);
  });

  it("uses default delay of 300ms when not specified", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: "x" } }
    );
    rerender({ value: "y" });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe("y");
  });
});
