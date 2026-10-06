import { act, renderHook } from "@testing-library/react";
import { useDebounce } from "@/hooks/useDebounce";

describe("useDebounce", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("only emits the last value after the delay", () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), { initialProps: { v: "" } });
    rerender({ v: "r" });
    rerender({ v: "ru" });
    rerender({ v: "rus" });
    act(() => void jest.advanceTimersByTime(299));
    expect(result.current).toBe("");
    act(() => void jest.advanceTimersByTime(1));
    expect(result.current).toBe("rus");
  });

  it("restarts the timer on every change", () => {
    const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), { initialProps: { v: "a" } });
    rerender({ v: "ab" });
    act(() => void jest.advanceTimersByTime(200));
    rerender({ v: "abc" });
    act(() => void jest.advanceTimersByTime(200));
    expect(result.current).toBe("a");
    act(() => void jest.advanceTimersByTime(100));
    expect(result.current).toBe("abc");
  });
});
