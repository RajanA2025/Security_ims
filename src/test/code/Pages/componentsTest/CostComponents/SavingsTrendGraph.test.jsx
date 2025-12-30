// SavingsTrendGraph.test.jsx
import React from "react";
import { render, screen, act } from "@testing-library/react";
import { vi } from "vitest";

// ----------------------
// Mocks
// ----------------------

// Minimal antd Card mock
vi.mock("antd", () => {
  const React = require("react");
  const Card = ({ children, ...props }) => <div data-testid="antd-card">{children}</div>;
  return { Card };
});

// Mock react-echarts-for-react to expose getEchartsInstance on ref and capture option
vi.mock("echarts-for-react", () => {
  const React = require("react");

  const ReactECharts = React.forwardRef(({ option, onChartReady, style }, ref) => {
    // create fake echarts instance with resize spy
    const instance = {
      resize: vi.fn(),
    };

    // expose getEchartsInstance
    React.useImperativeHandle(ref, () => ({
      getEchartsInstance: () => instance,
    }));

    // call onChartReady to simulate echarts lifecycle
    React.useEffect(() => {
      if (typeof onChartReady === "function") {
        onChartReady();
      }
    }, [onChartReady]);

    // store last option for assertions
    ReactECharts.__lastOption = option;
    ReactECharts.__instance = instance;

    return <div data-testid="react-echarts-mock" style={style}>MockChart</div>;
  });

  // Return as default export
  return {
    __esModule: true,
    default: ReactECharts
  };
});

// ResizeObserver mock capturing callback
let lastROCallback = null;
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    lastROCallback = cb;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// ----------------------
// Import component after mocks
// ----------------------
import SavingsTrendGraph from "c:/project/jit_ms1/Security_ims/src/components/CostComponents/SavingsTrendGraph.jsx";
import ReactECharts from "echarts-for-react";

describe("SavingsTrendGraph", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastROCallback = null;
  });

  test("renders title and chart placeholder", async () => {
    await act(async () => {
      render(<SavingsTrendGraph />);
    });

    expect(screen.getByTestId("antd-card")).toBeInTheDocument();
    expect(screen.getByTestId("react-echarts-mock")).toBeInTheDocument();

    // option should be captured
    expect(ReactECharts.__lastOption).toBeDefined();
    expect(Array.isArray(ReactECharts.__lastOption.series)).toBe(true);
  });

  test("chart options include correct formatter and data", async () => {
    await act(async () => {
      render(<SavingsTrendGraph />);
    });

    const option = ReactECharts.__lastOption;
    expect(option).toBeDefined();
    
    // Test the yAxis formatter function
    expect(option.yAxis.axisLabel.formatter).toBeDefined();
    expect(typeof option.yAxis.axisLabel.formatter).toBe('function');
    
    // Test the formatter function with different values
    const formatter = option.yAxis.axisLabel.formatter;
    expect(formatter(100)).toBe('$100');
    expect(formatter(0)).toBe('$0');
    expect(formatter(999)).toBe('$999');
    
    // Verify the x-axis categories
    expect(option.xAxis.data).toEqual(["Jan", "Feb", "Mar", "Apr", "May", "Jun"]);
    
    // Verify series data
    expect(option.series).toHaveLength(4);
    expect(option.series[0].name).toBe("Tagged");
    expect(option.series[0].data).toEqual([120, 200, 150, 180, 170, 190]);
    expect(option.series[1].name).toBe("Untagged");
    expect(option.series[1].data).toEqual([90, 180, 130, 160, 150, 170]);
    expect(option.series[2].name).toBe("Non-Taggable");
    expect(option.series[2].data).toEqual([50, 100, 80, 90, 70, 60]);
    expect(option.series[3].name).toBe("Total");
    expect(option.series[3].data).toEqual([260, 480, 360, 430, 390, 420]);
  });

  test("calls getEchartsInstance().resize on onChartReady", async () => {
    await act(async () => {
      render(<SavingsTrendGraph />);
    });

    const inst = ReactECharts.__instance;
    expect(inst).toBeDefined();
    // onChartReady should cause a call to resize via forceResize
    expect(inst.resize).toHaveBeenCalled();
  });

  test("resize is called when ResizeObserver callback triggers", async () => {
    await act(async () => {
      render(<SavingsTrendGraph />);
    });

    const inst = ReactECharts.__instance;
    inst.resize.mockClear();

    // Mock requestAnimationFrame to call the callback immediately
    const originalRAF = window.requestAnimationFrame;
    const rafCbs = [];
    window.requestAnimationFrame = (cb) => {
      rafCbs.push(cb);
      return 0;
    };

    try {
      // simulate ResizeObserver callback
      await act(async () => {
        if (typeof lastROCallback === "function") lastROCallback();
        // Execute the queued requestAnimationFrame callbacks
        while (rafCbs.length) {
          const cb = rafCbs.shift();
          cb();
        }
        // Allow any pending promises to resolve
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(inst.resize).toHaveBeenCalled();
    } finally {
      // Restore original requestAnimationFrame
      window.requestAnimationFrame = originalRAF;
    }
  });

  test("resize is called on window resize event", async () => {
    await act(async () => {
      render(<SavingsTrendGraph />);
    });

    const inst = ReactECharts.__instance;
    inst.resize.mockClear();

    // Mock requestAnimationFrame to call the callback immediately
    const originalRAF = window.requestAnimationFrame;
    const rafCbs = [];
    window.requestAnimationFrame = (cb) => {
      rafCbs.push(cb);
      return 0;
    };

    try {
      await act(async () => {
        window.dispatchEvent(new Event("resize"));
        // Execute the queued requestAnimationFrame callbacks
        while (rafCbs.length) {
          const cb = rafCbs.shift();
          cb();
        }
        // Allow any pending promises to resolve
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(inst.resize).toHaveBeenCalled();
    } finally {
      // Restore original requestAnimationFrame
      window.requestAnimationFrame = originalRAF;
    }
  });
});
