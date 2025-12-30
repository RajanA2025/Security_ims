// Chart.test.jsx
import React from "react";
import { render, cleanup, act } from "@testing-library/react";
import { vi } from "vitest";

// Mock echarts before importing the component
const setOptionMock = vi.fn();
const resizeMock = vi.fn();
const disposeMock = vi.fn();

vi.mock("echarts", () => {
  return {
    init: vi.fn(() => ({
      setOption: setOptionMock,
      resize: resizeMock,
      dispose: disposeMock,
    })),
  };
});

import Chart from "c:/project/jit_ms1/Security_ims/src/components/dashboard/chart.jsx";
import * as echarts from "echarts";

describe("Chart component (echarts integration / mocked)", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  test("renders without crashing and calls echarts.init & setOption", () => {
    const labels = ["A", "B", "C"];
    const data = [10, 20, 30];

    const { container } = render(<Chart labels={labels} data={data} />);

    // echarts.init should be called with the DOM node
    expect(echarts.init).toHaveBeenCalledTimes(1);
    const initArg = echarts.init.mock.calls[0][0];
    // initArg should be the rendered div element
    expect(initArg).toBeInstanceOf(HTMLElement);
    // setOption should be called once
    expect(setOptionMock).toHaveBeenCalledTimes(1);

    const option = setOptionMock.mock.calls[0][0];
    // basic structure checks
    expect(option).toHaveProperty("series");
    expect(Array.isArray(option.series)).toBe(true);
    expect(option.series[0]).toHaveProperty("type", "bar");

    // data mapping check: series.data should reflect provided data and have itemStyle colors
    const seriesData = option.series[0].data;
    expect(seriesData.length).toBe(3);
    expect(seriesData[0]).toHaveProperty("value", 10);
    expect(seriesData[1]).toHaveProperty("value", 20);
    expect(seriesData[2]).toHaveProperty("value", 30);
    expect(seriesData[0]).toHaveProperty("itemStyle");
    expect(seriesData[0].itemStyle).toHaveProperty("color");
  });

  test("calls resize on window resize and disposes on unmount", () => {
    const labels = ["X"];
    const data = [5];

    const { unmount } = render(<Chart labels={labels} data={data} />);

    // simulate window resize
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    // chart resize should have been called at least once (registered handler)
    expect(resizeMock).toHaveBeenCalled();

    // unmount should call dispose
    unmount();
    expect(disposeMock).toHaveBeenCalled();
  });

  test("updates option when props change", () => {
    const { rerender } = render(<Chart labels={["L1"]} data={[1]} />);

    // initial setOption called once
    expect(setOptionMock).toHaveBeenCalledTimes(1);

    // update props
    act(() => {
      rerender(<Chart labels={["L1", "L2"]} data={[1, 2]} />);
    });

    // setOption should be called again (component updates options on dependency change)
    expect(setOptionMock).toHaveBeenCalledTimes(2);

    const latestOption = setOptionMock.mock.calls[1][0];
    expect(latestOption.series[0].data.length).toBe(2);
    expect(latestOption.series[0].data[1].value).toBe(2);
  });
});
