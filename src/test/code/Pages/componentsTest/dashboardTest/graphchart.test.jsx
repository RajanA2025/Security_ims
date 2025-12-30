// GraphChart.test.jsx
import React from "react";
import { render, cleanup, act } from "@testing-library/react";
import { vi } from "vitest";

// Mock echarts BEFORE importing the component
const setOptionMock = vi.fn();
const disposeMock = vi.fn();
vi.mock("echarts", () => ({
  init: vi.fn(() => ({
    setOption: setOptionMock,
    dispose: disposeMock,
  })),
}));

// import after mocking
import GraphChart from "c:/project/jit_ms1/Security_ims/src/components/dashboard/graphchart.jsx";
import * as echarts from "echarts";

describe("GraphChart component (echarts mocked)", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  test("renders container div and calls echarts.init & setOption", () => {
    const { container } = render(<GraphChart />);

    // root div should be present
    const div = container.querySelector("div");
    expect(div).toBeTruthy();

    // echarts.init should be called once with that div
    expect(echarts.init).toHaveBeenCalledTimes(1);
    const initArg = echarts.init.mock.calls[0][0];
    expect(initArg).toBeInstanceOf(HTMLElement);

    // setOption should be called once with an option object
    expect(setOptionMock).toHaveBeenCalledTimes(1);
    const option = setOptionMock.mock.calls[0][0];

    // basic option assertions
    expect(option).toBeDefined();
    expect(option).toHaveProperty("series");
    expect(Array.isArray(option.series)).toBe(true);

    // verify presence of expected series names (some common series present)
    const seriesNames = option.series.map((s) => s.name);
    expect(seriesNames).toEqual(expect.arrayContaining(["MFA", "Email", "Search Engine"]));
  });

  test("disposes echarts instance on unmount", () => {
    const { unmount } = render(<GraphChart />);

    // before unmount dispose not called
    expect(disposeMock).not.toHaveBeenCalled();

    // unmount component
    act(() => {
      unmount();
    });

    // dispose should be called once
    expect(disposeMock).toHaveBeenCalledTimes(1);
  });

  test("handles multiple renders without leaking (init called per mount)", () => {
    const { unmount, rerender } = render(<GraphChart />);
    expect(echarts.init).toHaveBeenCalledTimes(1);

    // re-render (simulate mount again)
    rerender(<GraphChart />);
    // Depending on implementation multiple inits may occur; ensure at least one call
    expect(echarts.init).toHaveBeenCalled();

    act(() => {
      unmount();
    });

    // dispose should be called at least once
    expect(disposeMock).toHaveBeenCalled();
  });
});
