import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "./useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns initialValue when nothing is stored", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", 42));
    expect(result.current[0]).toBe(42);
  });

  it("persists a value to localStorage", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", 0));
    act(() => {
      result.current[1](99);
    });
    expect(result.current[0]).toBe(99);
    expect(JSON.parse(window.localStorage.getItem("test-key")!)).toBe(99);
  });

  it("accepts a function updater", () => {
    const { result } = renderHook(() => useLocalStorage("counter", 0));
    act(() => {
      result.current[1]((prev) => prev + 1);
    });
    expect(result.current[0]).toBe(1);
  });

  it("reads an existing value from localStorage on mount", () => {
    window.localStorage.setItem("greeting", JSON.stringify("hello"));
    const { result } = renderHook(() => useLocalStorage("greeting", "default"));
    expect(result.current[0]).toBe("hello");
  });

  it("remove() clears the key and resets to initialValue", () => {
    const { result } = renderHook(() => useLocalStorage("rm-key", "initial"));
    act(() => {
      result.current[1]("changed");
    });
    expect(result.current[0]).toBe("changed");
    act(() => {
      result.current[2](); // remove
    });
    expect(result.current[0]).toBe("initial");
    expect(window.localStorage.getItem("rm-key")).toBeNull();
  });

  it("works with array values", () => {
    const { result } = renderHook(() => useLocalStorage<string[]>("arr", []));
    act(() => {
      result.current[1](["a", "b"]);
    });
    expect(result.current[0]).toEqual(["a", "b"]);
  });

  it("handles malformed JSON gracefully by falling back to initialValue", () => {
    window.localStorage.setItem("bad-json", "{not valid json");
    const { result } = renderHook(() => useLocalStorage("bad-json", "fallback"));
    expect(result.current[0]).toBe("fallback");
  });
});
