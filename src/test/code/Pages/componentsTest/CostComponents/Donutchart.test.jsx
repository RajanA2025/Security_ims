// DonutChart.test.jsx
import React from "react";
import { render, screen, act } from "@testing-library/react";
import { vi } from "vitest";

// ----------------------
// Mocks
// ----------------------

// Mock antd minimal pieces used in DonutChart
vi.mock("antd", () => {
  const React = require("react");
  const Card = ({ children, bodyStyle, style }) => (
    <div data-testid="antd-card" style={style}>
      {children}
    </div>
  );
  const Typography = {
    Title: ({ children }) => <h5>{children}</h5>,
  };
  return { Card, Typography };
});

// Mock react-echarts-for-react
vi.mock("echarts-for-react", () => {
  const React = require("react");

  // A mock component that captures the option prop and exposes getEchartsInstance via ref
  const ReactECharts = React.forwardRef(({ option, style, opts }, ref) => {
    // store the last option so tests can inspect it
    ReactECharts.__lastOption = option;
    // Provide a fake echarts instance with resize() method
    const instance = {
      resize: vi.fn(),
      getOption: () => option,
    };
    React.useImperativeHandle(ref, () => ({
      getEchartsInstance: () => instance,
    }));
    return (
      <div data-testid="react-echarts-mock" style={style}>
        {/* render some readable info for tests */}
        <div data-testid="chart-option-json" data-option={JSON.stringify(option)}>
          Chart
        </div>
      </div>
    );
  });

  return {
    default: ReactECharts
  };
});

// Mock ResizeObserver (used in component)
global.ResizeObserver = class {
  constructor(cb) {
    this.callback = cb;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock CostContext so we can control costData & loading in tests
vi.mock("c:/project/jit_ms1/Security_ims/src/Context/CostContext", async () => {
  const React = await vi.importActual("react");
  return {
    CostContext: React.createContext(),
  };
});

// Import component after mocks
import { CostContext } from "c:/project/jit_ms1/Security_ims/src/Context/CostContext";
import DonutChart from "c:/project/jit_ms1/Security_ims/src/components/CostComponents/DonutChart.jsx";
import ReactECharts from "echarts-for-react";

describe("DonutChart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test("shows loading state when loading=true", () => {
    render(
      <CostContext.Provider value={{ costData: null, loading: true }}>
        <DonutChart />
      </CostContext.Provider>
    );

    // Loading is rendered as Card with "Loading..."
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("shows 'No service cost data available' when no monthly_summary", () => {
    const costData = { monthly_summary: null }; // explicit missing monthly_summary
    render(
      <CostContext.Provider value={{ costData, loading: false }}>
        <DonutChart />
      </CostContext.Provider>
    );

    expect(screen.getByText(/No service cost data available/i)).toBeInTheDocument();
  });

  test("renders chart when service_wise_costs present and includes total in graphic", async () => {
    // Prepare mock data: several services with values
    const service_wise_costs = [
      { service_name: "SVC-A", total_cost: 100 },
      { service_name: "SVC-B", total_cost: 2 },   // may be merged into Others depending on threshold
      { service_name: "SVC-C", total_cost: 3 },
      { service_name: "SVC-D", total_cost: 5 },
    ];
    const current_month_cost = 110; // total to compare percentages

    const costData = {
      monthly_summary: {
        service_wise_costs,
        current_month_cost,
      },
    };

    await act(async () => {
      render(
        <CostContext.Provider value={{ costData, loading: false }}>
          <DonutChart />
        </CostContext.Provider>
      );
    });

    // ReactECharts mock should be present
    const chart = screen.getByTestId("react-echarts-mock");
    expect(chart).toBeInTheDocument();

    // Inspect the option passed to ReactECharts via our mock's stored __lastOption
    const option = ReactECharts.__lastOption;
    expect(option).toBeDefined();

    // option.series[0].data should be an array of objects with name & value
    expect(option.series).toBeDefined();
    expect(option.series[0]).toBeDefined();
    const seriesData = option.series[0].data;

    // All items should have name and value
    expect(Array.isArray(seriesData)).toBe(true);
    seriesData.forEach((d) => {
      expect(d).toHaveProperty("name");
      expect(d).toHaveProperty("value");
    });

    // The graphic array should include the total spend text; check that it contains $current_month_cost
    const graphic = option.graphic || [];
    const hasTotal = graphic.some((g) => {
      const txt = (g?.style?.text || "").toString();
      return txt.includes(`$${Number(current_month_cost).toFixed(2)}`);
    });

    // In your option the total is formatted with total.toFixed(2)
    expect(hasTotal).toBe(true);
  });
});
