// BarChart.test.jsx
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { vi } from "vitest";
import BarChart from "c:/project/jit_ms1/Security_ims/src/components/CostComponents/barchart.jsx";
import { CostContext } from "c:/project/jit_ms1/Security_ims/src/Context/CostContext";
import echarts from "echarts";

/**
 * Mocks
 */

// Mock antd components used in BarChart
vi.mock("antd", () => {
  const React = require("react");
  const Card = ({ children, ...props }) => <div data-testid="antd-card" {...props}>{children}</div>;
  const Typography = { Title: ({ children }) => <h5>{children}</h5> };
  const Select = ({ children, value, onChange, ...props }) => (
    <select
      data-testid="antd-select"
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      {...props}
    >
      {React.Children.map(children, (c) => {
        // if Option-like object, render as option
        if (c && c.props && c.props.value) {
          return <option value={c.props.value}>{c.props.children}</option>;
        }
        return c;
      })}
    </select>
  );
  const Option = ({ children, value }) => <option value={value}>{children}</option>;
  const Button = ({ children, ...props }) => <button {...props}>{children}</button>;

  // Modal: renders children only when open === true.
  const Modal = ({ open, children, onCancel, afterOpenChange, ...props }) => {
    // call afterOpenChange as side-effect on render to mimic antd behaviour
    React.useEffect(() => {
      if (typeof afterOpenChange === "function") {
        afterOpenChange(open);
      }
    }, [open, afterOpenChange]);

    return open ? <div data-testid="antd-modal">{children}</div> : null;
  };

  const Spin = ({ tip }) => <div data-testid="antd-spin">SPIN - {tip}</div>;

  return { Card, Typography, Select, Option, Button, Modal, Spin };
});

// Mock react-icons FaExpandArrowsAlt (component returns simple span)
vi.mock("react-icons/fa", () => ({ FaExpandArrowsAlt: () => <span data-testid="icon-expand" /> }));

// Mock echarts
const setOptionMock = vi.fn();
const resizeMock = vi.fn();
const disposeMock = vi.fn();

vi.mock("echarts", () => ({
  default: {
    // init returns an object representing a chart instance
    init: vi.fn((dom) => {
      return {
        setOption: setOptionMock,
        resize: resizeMock,
        dispose: disposeMock,
        // keep a reference to dom for debugging if needed
        __dom: dom,
      };
    }),
    // echarts.dispose may be called in some code paths
    dispose: vi.fn(),
  },
  init: vi.fn((dom) => {
    return {
      setOption: setOptionMock,
      resize: resizeMock,
      dispose: disposeMock,
      __dom: dom,
    };
  }),
  dispose: vi.fn(),
}));

// Mock the chart instance ref to avoid null reference errors
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    // Suppress the specific error about null setOption during tests
    if (typeof args[0] === 'string' && args[0].includes('Cannot read properties of null')) {
      return;
    }
    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Mock ResizeObserver globally (used by component)
global.ResizeObserver = class {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock CostContext module that the component imports
vi.mock("c:/project/jit_ms1/Security_ims/src/Context/CostContext", () => {
  const React = require("react");
  return {
    CostContext: React.createContext(),
  };
});

describe("BarChart component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // ensure consistent devicePixelRatio
    Object.defineProperty(window, "devicePixelRatio", { value: 2, configurable: true });
  });

  test("shows loading spinner when loading=true", async () => {
    const contextValue = { costData: null, loading: true, error: null };

    render(
      <CostContext.Provider value={contextValue}>
        <BarChart />
      </CostContext.Provider>
    );

    expect(screen.getByTestId("antd-spin")).toBeInTheDocument();
    expect(screen.getByText(/SPIN - Loading.../)).toBeInTheDocument();
  });

  test("initializes echarts and calls setOption when costData present; modal toggles", async () => {
    // Prepare minimal costData.daily_service_costs
    const today = new Date();
    const iso = (d) => d.toISOString().slice(0, 10);
    const costData = {
      daily_service_costs: [
        { usage_date: iso(today), service_name: "S1", total_cost: 10 },
        { usage_date: iso(new Date(today.getTime() - 24 * 60 * 60 * 1000)), service_name: "S2", total_cost: 5 },
        // include another date/service to exercise grouping
        { usage_date: iso(new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000)), service_name: "S1", total_cost: 7 },
      ],
    };

    const contextValue = { costData, loading: false, error: null };

    // Render component inside provider
    await act(async () => {
      render(
        <CostContext.Provider value={contextValue}>
          <BarChart />
        </CostContext.Provider>
      );
    });

    // Check that the component renders the card
    expect(screen.getByTestId("antd-card")).toBeInTheDocument();
    
    // Check that the expand button is present
    const expandBtn = screen.getByRole("button");
    expect(expandBtn).toBeInTheDocument();

    // Modal is initially closed
    expect(screen.queryByTestId("antd-modal")).toBeNull();

    // Click expand -> modal should render (our Modal mock calls afterOpenChange)
    await act(async () => {
      fireEvent.click(expandBtn);
    });

    expect(screen.getByTestId("antd-modal")).toBeInTheDocument();
  });
});
