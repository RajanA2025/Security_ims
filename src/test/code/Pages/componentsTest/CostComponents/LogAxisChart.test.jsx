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
});
