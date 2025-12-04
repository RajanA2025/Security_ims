// LineChart.test.jsx
import React from "react";
import { render, cleanup, act } from "@testing-library/react";
import { vi } from "vitest";

// Mock echarts BEFORE importing the component
const setOptionMock = vi.fn();
const disposeMock = vi.fn();
const resizeMock = vi.fn();

vi.mock("echarts", () => ({
  init: vi.fn(() => ({
    setOption: setOptionMock,
    dispose: disposeMock,
    resize: resizeMock,
  })),
}));

// import after mocking
import LineChart from "c:/project/jit_ms1/Security_ims/src/components/dashboard/linechart.jsx";
import * as echarts from "echarts";

describe("LineChart component (echarts mocked)", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  test("calls echarts.init and setOption with provided props", () => {
    const labels = ["Jan", "Feb", "Mar"];
    const data = [10, 20, 15];
    const title = "My Test Chart";

    render(<LineChart labels={labels} data={data} title={title} />);

    // echarts.init called once
    expect(echarts.init).toHaveBeenCalledTimes(1);
    const initArg = echarts.init.mock.calls[0][0];
    // the first argument should be an HTMLElement (the container div)
    expect(initArg).toBeInstanceOf(HTMLElement);

    // setOption called once with an option object
    expect(setOptionMock).toHaveBeenCalledTimes(1);
    const option = setOptionMock.mock.calls[0][0];
    expect(option).toBeDefined();
    expect(option).toHaveProperty("series");
    expect(option).toHaveProperty("xAxis");
    // title should match prop
    expect(option.title).toBeDefined();
    expect(option.title.text).toBe(title);
    // xAxis data should equal labels
    expect(option.xAxis.data).toEqual(labels);
    // series data should equal data array
    expect(option.series[0].data).toEqual(data);
  });

  test("handles window resize by calling chart.resize", () => {
    render(<LineChart labels={["A"]} data={[1]} title="Resize Test" />);

    // dispatch a resize event
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });

    // resize should have been invoked on the echarts instance
    expect(resizeMock).toHaveBeenCalled();
  });

  test("disposes echarts instance on unmount", () => {
    const { unmount } = render(<LineChart labels={["A"]} data={[1]} title="Dispose Test" />);

    // before unmount dispose not called
    expect(disposeMock).not.toHaveBeenCalled();

    act(() => {
      unmount();
    });

    // after unmount dispose should be called
    expect(disposeMock).toHaveBeenCalledTimes(1);
  });
});
