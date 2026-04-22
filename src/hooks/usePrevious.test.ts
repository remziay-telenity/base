import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePrevious } from "./usePrevious";

describe("usePrevious", () => {
  it("returns undefined on the first render", () => {
    const { result } = renderHook(() => usePrevious(42));
    expect(result.current).toBeUndefined();
  });

  it("returns the previous value after a re-render", () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 1 } }
    );
    rerender({ value: 2 });
    expect(result.current).toBe(1);
  });

  it("tracks multiple successive values correctly", () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: "a" } }
    );
    rerender({ value: "b" });
    expect(result.current).toBe("a");
    rerender({ value: "c" });
    expect(result.current).toBe("b");
  });

  it("works with null and undefined values", () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: null as string | null } }
    );
    rerender({ value: "hello" });
    expect(result.current).toBeNull();
  });
});
