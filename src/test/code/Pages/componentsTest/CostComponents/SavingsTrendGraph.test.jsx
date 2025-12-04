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
