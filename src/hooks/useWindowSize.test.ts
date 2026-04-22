import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWindowSize } from "./useWindowSize";

describe("useWindowSize", () => {
  let originalWidth: number;
  let originalHeight: number;

  beforeEach(() => {
    originalWidth = window.innerWidth;
    originalHeight = window.innerHeight;
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", { value: originalWidth, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: originalHeight, configurable: true });
  });

  it("returns initial window dimensions", () => {
    Object.defineProperty(window, "innerWidth", { value: 1280, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 720, configurable: true });

    const { result } = renderHook(() => useWindowSize());
    expect(result.current.width).toBe(1280);
    expect(result.current.height).toBe(720);
  });

  it("updates when window resizes", () => {
    const { result } = renderHook(() => useWindowSize());

    act(() => {
      Object.defineProperty(window, "innerWidth", { value: 375, configurable: true });
      Object.defineProperty(window, "innerHeight", { value: 667, configurable: true });
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current.width).toBe(375);
    expect(result.current.height).toBe(667);
  });

  it("returns numeric width and height in a browser environment", () => {
    const { result } = renderHook(() => useWindowSize());
    expect(typeof result.current.width).toBe("number");
    expect(typeof result.current.height).toBe("number");
  });
});
