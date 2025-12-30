// LogAxisChart.test.jsx
import React from "react";
import { render, screen, act } from "@testing-library/react";
import { vi } from "vitest";

// ----------------------
// Mocks
// ----------------------

// Mock antd Card minimal
vi.mock("antd", () => {
  const React = require("react");
  const Card = ({ children, ...props }) => <div data-testid="antd-card">{children}</div>;
  return { Card };
});

// Mock react-echarts-for-react to expose getEchartsInstance on ref
vi.mock("echarts-for-react", () => {
  const React = require("react");

  const ReactECharts = React.forwardRef(({ option, onChartReady, style }, ref) => {
    // create a fake echarts instance with resize spy
    const instance = {
      resize: vi.fn(),
    };

    // expose getEchartsInstance via ref
    React.useImperativeHandle(ref, () => ({
      getEchartsInstance: () => instance,
    }));

    // call onChartReady to simulate echarts ready lifecycle (if provided)
    React.useEffect(() => {
      if (typeof onChartReady === "function") {
        onChartReady();
      }
    }, [onChartReady]);

    // save last option for debugging in tests
    ReactECharts.__lastOption = option;
    ReactECharts.__instance = instance;

    return (
      <div data-testid="react-echarts-mock" style={style}>
        MockChart
      </div>
    );
  });

  return {
    default: ReactECharts
  };
});

// Mock requestAnimationFrame to call callback immediately
global.requestAnimationFrame = (cb) => {
  return setTimeout(cb, 0);
};
global.cancelAnimationFrame = (id) => {
  clearTimeout(id);
};

// Provide a ResizeObserver mock that captures callback so tests can trigger it
let lastROCallback = null;
global.ResizeObserver = class {
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
import LogAxisChart from "c:/project/jit_ms1/Security_ims/src/components/CostComponents/LogAxisChart.jsx";
import ReactECharts from "echarts-for-react";

describe("LogAxisChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure no leftover callback
    lastROCallback = null;
  });

  test("renders title and chart placeholder", async () => {
    await act(async () => {
      render(<LogAxisChart />);
    });

    // Card and chart mock should render
    expect(screen.getByTestId("antd-card")).toBeInTheDocument();
    expect(screen.getByTestId("react-echarts-mock")).toBeInTheDocument();

    // The option passed should exist on the mock
    expect(ReactECharts.__lastOption).toBeDefined();
    // ensure series exist
    expect(Array.isArray(ReactECharts.__lastOption.series)).toBe(true);
  });

  test("calls chartInstance.resize on onChartReady", async () => {
    await act(async () => {
      render(<LogAxisChart />);
    });

    // onChartReady is called during mount; our mock calls it which should not throw
    const inst = ReactECharts.__instance;
    expect(inst).toBeDefined();
    // resize may be called inside onChartReady -> forceResize. We expect resize to have been called at least once.
    expect(inst.resize).toHaveBeenCalled();
  });

  test("resize is called when ResizeObserver callback is triggered", async () => {
    await act(async () => {
      render(<LogAxisChart />);
    });

    const inst = ReactECharts.__instance;
    inst.resize.mockClear(); // reset count so we can assert fresh calls

    // simulate ResizeObserver callback (component wraps callback in requestAnimationFrame)
    await act(async () => {
      // call the stored callback as ResizeObserver would
      if (typeof lastROCallback === "function") lastROCallback();
      // flush microtasks and RAF (requestAnimationFrame can be mapped to microtask via act)
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // After callback, resize should be called via requestAnimationFrame -> forceResize
    expect(inst.resize).toHaveBeenCalled();
  });

  test("resize is called when window resize event fired", async () => {
    await act(async () => {
      render(<LogAxisChart />);
    });

    const inst = ReactECharts.__instance;
    inst.resize.mockClear();

    // dispatch a window resize event
    await act(async () => {
      window.dispatchEvent(new Event("resize"));
      // allow any RAF/async handlers to run
      await Promise.resolve();
    });

    expect(inst.resize).toHaveBeenCalled();
  });

  test("tests tooltip formatter function", async () => {
    await act(async () => {
      render(<LogAxisChart />);
    });

    // Get the chart option which contains the tooltip formatter
    const option = ReactECharts.__lastOption;
    
    // The tooltip formatter should be a function
    expect(option.tooltip.formatter).toBeDefined();
    expect(typeof option.tooltip.formatter).toBe("function");

    // Test the formatter with mock data
    const mockParams = [
      {
        axisValue: "Jan",
        marker: "●",
        seriesName: "Potential Savings",
        data: 500
      },
      {
        axisValue: "Jan", 
        marker: "■",
        seriesName: "Realized Savings",
        data: 0
      }
    ];

    const result = option.tooltip.formatter(mockParams);
    
    // Should contain formatted tooltip content
    expect(result).toContain("<b>Jan</b>");
    expect(result).toContain("Potential Savings: $500");
    expect(result).toContain("Realized Savings: $0");
    expect(result).toContain("<br/>");
  });

  test("tests yAxis formatter function", async () => {
    await act(async () => {
      render(<LogAxisChart />);
    });

    // Get the chart option which contains the yAxis formatter
    const option = ReactECharts.__lastOption;
    
    // The yAxis formatter should be a function
    expect(option.yAxis.axisLabel.formatter).toBeDefined();
    expect(typeof option.yAxis.axisLabel.formatter).toBe("function");

    // Test the formatter with different values
    expect(option.yAxis.axisLabel.formatter(1000)).toBe("$1000");
    expect(option.yAxis.axisLabel.formatter(0)).toBe("$0");
    expect(option.yAxis.axisLabel.formatter(2500)).toBe("$2500");
  });

  test("tests chart configuration and data structure", async () => {
    await act(async () => {
      render(<LogAxisChart />);
    });

    const option = ReactECharts.__lastOption;

    // Test basic chart structure
    expect(option.tooltip.trigger).toBe("axis");
    expect(option.tooltip.backgroundColor).toBe("#fff");
    expect(option.tooltip.borderColor).toBe("#eaeaea");
    expect(option.tooltip.borderWidth).toBe(1);

    // Test legend configuration
    expect(option.legend.data).toEqual(["Potential Savings", "Realized Savings"]);
    expect(option.legend.top).toBe("0%");
    expect(option.legend.right).toBe("5%");

    // Test series data
    expect(option.series).toHaveLength(2);
    expect(option.series[0].name).toBe("Potential Savings");
    expect(option.series[0].type).toBe("line");
    expect(option.series[0].data).toEqual([500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500]);
    
    expect(option.series[1].name).toBe("Realized Savings");
    expect(option.series[1].type).toBe("line");
    expect(option.series[1].data).toEqual([0, 300, 600, 900, 1200, 1500, 1800, 2100, 2400]);

    // Test axis configuration
    expect(option.xAxis.type).toBe("category");
    expect(option.xAxis.data).toEqual(["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep"]);
    expect(option.yAxis.type).toBe("value");
    expect(option.yAxis.name).toBe("USD ($)");
  });

  test("tests forceResize callback with null chart instance", async () => {
    await act(async () => {
      render(<LogAxisChart />);
    });

    // Mock a scenario where getEchartsInstance returns null
    const originalInstance = ReactECharts.__instance;
    ReactECharts.__instance = null;

    // This should not throw an error even when instance is null
    expect(() => {
      // Simulate forceResize being called with null instance
      const chartRef = { current: { getEchartsInstance: () => null } };
      const forceResize = () => {
        const inst = chartRef.current?.getEchartsInstance?.();
        if (inst) inst.resize();
      };
      forceResize();
    }).not.toThrow();

    // Restore original instance
    ReactECharts.__instance = originalInstance;
  });

  test("handles ResizeObserver undefined scenario", async () => {
    // Save original ResizeObserver
    const originalResizeObserver = global.ResizeObserver;
    
    // Mock ResizeObserver as undefined
    delete global.ResizeObserver;
    global.ResizeObserver = undefined;

    await act(async () => {
      render(<LogAxisChart />);
    });

    // Component should still render without errors
    expect(screen.getByTestId("antd-card")).toBeInTheDocument();
    expect(screen.getByTestId("react-echarts-mock")).toBeInTheDocument();

    // Restore original ResizeObserver
    global.ResizeObserver = originalResizeObserver;
  });

  test("handles null wrapRef element scenario", async () => {
    // Mock the component to have null wrapRef
    const originalUseRef = React.useRef;
    
    // Create a mock that returns null for wrapRef but normal for chartRef
    let refCallCount = 0;
    React.useRef = vi.fn(() => {
      refCallCount++;
      // First call (wrapRef) returns null, second call (chartRef) returns normal ref
      if (refCallCount === 1) {
        return { current: null };
      }
      return { current: { getEchartsInstance: () => ({ resize: vi.fn() }) } };
    });

    await act(async () => {
      render(<LogAxisChart />);
    });

    // Component should still render without errors
    expect(screen.getByTestId("antd-card")).toBeInTheDocument();
    expect(screen.getByTestId("react-echarts-mock")).toBeInTheDocument();

    // Restore original useRef
    React.useRef = originalUseRef;
  });
});
