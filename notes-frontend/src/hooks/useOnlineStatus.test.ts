import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useOnlineStatus } from "./useOnlineStatus";

const onlineDescriptor = Object.getOwnPropertyDescriptor(
  window.navigator,
  "onLine",
);

describe("useOnlineStatus", () => {
  afterEach(() => {
    if (onlineDescriptor) {
      Object.defineProperty(window.navigator, "onLine", onlineDescriptor);
    }
  });

  it("tracks browser online and offline events", () => {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: true,
    });
    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current).toBe(true);

    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: false,
    });
    act(() => window.dispatchEvent(new Event("offline")));
    expect(result.current).toBe(false);

    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: true,
    });
    act(() => window.dispatchEvent(new Event("online")));
    expect(result.current).toBe(true);
  });
});
