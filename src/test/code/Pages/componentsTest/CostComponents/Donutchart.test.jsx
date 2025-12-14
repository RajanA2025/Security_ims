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

  test("handles empty service_wise_costs array", async () => {
    const costData = {
      monthly_summary: {
        service_wise_costs: [],
        current_month_cost: 0,
      },
    };

    await act(async () => {
      render(
        <CostContext.Provider value={{ costData, loading: false }}>
          <DonutChart />
        </CostContext.Provider>
      );
    });

    // Should show no data message
    expect(screen.getByText(/No service cost data available/i)).toBeInTheDocument();
  });

  test("handles service_wise_costs with only invalid/negative values", async () => {
    const costData = {
      monthly_summary: {
        service_wise_costs: [
          { service_name: "Invalid1", total_cost: -5 },
          { service_name: "Invalid2", total_cost: null },
          { service_name: "Invalid3", total_cost: undefined },
          { service_name: "Invalid4", total_cost: "not-a-number" },
          { service_name: "Zero", total_cost: 0 },
        ],
        current_month_cost: 100,
      },
    };

    await act(async () => {
      render(
        <CostContext.Provider value={{ costData, loading: false }}>
          <DonutChart />
        </CostContext.Provider>
      );
    });

    // Should show no data message since all values are filtered out
    expect(screen.getByText(/No service cost data available/i)).toBeInTheDocument();
  });

  test("aggregates services with same name", async () => {
    const costData = {
      monthly_summary: {
        service_wise_costs: [
          { service_name: "EC2", total_cost: 50 },
          { service_name: "S3", total_cost: 30 },
          { service_name: "EC2", total_cost: 20 }, // Duplicate service name
          { service_name: "RDS", total_cost: 10 },
        ],
        current_month_cost: 110,
      },
    };

    await act(async () => {
      render(
        <CostContext.Provider value={{ costData, loading: false }}>
          <DonutChart />
        </CostContext.Provider>
      );
    });

    const option = ReactECharts.__lastOption;
    const seriesData = option.series[0].data;

    // Should have 3 items: EC2 (70), S3 (30), RDS (10) - EC2 aggregated
    expect(seriesData).toHaveLength(3);
    
    const ec2Item = seriesData.find(item => item.name === "EC2");
    expect(ec2Item).toBeDefined();
    expect(ec2Item.value).toBe(70); // 50 + 20 aggregated
    
    const s3Item = seriesData.find(item => item.name === "S3");
    expect(s3Item).toBeDefined();
    expect(s3Item.value).toBe(30);
    
    const rdsItem = seriesData.find(item => item.name === "RDS");
    expect(rdsItem).toBeDefined();
    expect(rdsItem.value).toBe(10);
  });

  test("creates Others group for small values", async () => {
    const costData = {
      monthly_summary: {
        service_wise_costs: [
          { service_name: "Large", total_cost: 100 }, // > 1%
          { service_name: "Small1", total_cost: 0.5 }, // < 1%
          { service_name: "Small2", total_cost: 0.3 }, // < 1%
          { service_name: "Small3", total_cost: 0.2 }, // < 1%
        ],
        current_month_cost: 101, // Total for percentage calculation
      },
    };

    await act(async () => {
      render(
        <CostContext.Provider value={{ costData, loading: false }}>
          <DonutChart />
        </CostContext.Provider>
      );
    });

    const option = ReactECharts.__lastOption;
    const seriesData = option.series[0].data;

    // Should have 2 items: Large (100) and Others (1.0)
    expect(seriesData).toHaveLength(2);
    
    const largeItem = seriesData.find(item => item.name === "Large");
    expect(largeItem).toBeDefined();
    expect(largeItem.value).toBe(100);
    
    const othersItem = seriesData.find(item => item.name === "Others");
    expect(othersItem).toBeDefined();
    expect(othersItem.value).toBe(1.0); // 0.5 + 0.3 + 0.2
  });

  test("handles missing current_month_cost and uses sum of services", async () => {
    const costData = {
      monthly_summary: {
        service_wise_costs: [
          { service_name: "Service1", total_cost: 50 },
          { service_name: "Service2", total_cost: 30 },
        ],
        current_month_cost: null, // Missing total
      },
    };

    await act(async () => {
      render(
        <CostContext.Provider value={{ costData, loading: false }}>
          <DonutChart />
        </CostContext.Provider>
      );
    });

    const option = ReactECharts.__lastOption;
    const graphic = option.graphic || [];
    
    // Should use sum of services (80) for total display
    const hasTotal = graphic.some((g) => {
      const txt = (g?.style?.text || "").toString();
      return txt.includes("$80.00");
    });
    
    expect(hasTotal).toBe(true);
  });

  test("handles zero current_month_cost and uses sum of services", async () => {
    const costData = {
      monthly_summary: {
        service_wise_costs: [
          { service_name: "Service1", total_cost: 50 },
          { service_name: "Service2", total_cost: 30 },
        ],
        current_month_cost: 0, // Zero total
      },
    };

    await act(async () => {
      render(
        <CostContext.Provider value={{ costData, loading: false }}>
          <DonutChart />
        </CostContext.Provider>
      );
    });

    const option = ReactECharts.__lastOption;
    const graphic = option.graphic || [];
    
    // Should use sum of services (80) for total display
    const hasTotal = graphic.some((g) => {
      const txt = (g?.style?.text || "").toString();
      return txt.includes("$80.00");
    });
    
    expect(hasTotal).toBe(true);
  });

  test("handles service_name missing or null", async () => {
    const costData = {
      monthly_summary: {
        service_wise_costs: [
          { service_name: null, total_cost: 50 },
          { service_name: undefined, total_cost: 30 },
          { service_name: "", total_cost: 20 },
          { service_name: "ValidService", total_cost: 40 },
        ],
        current_month_cost: 140,
      },
    };

    await act(async () => {
      render(
        <CostContext.Provider value={{ costData, loading: false }}>
          <DonutChart />
        </CostContext.Provider>
      );
    });

    const option = ReactECharts.__lastOption;
    const seriesData = option.series[0].data;

    // Should have items for "Unknown" (from null/undefined/empty) and "ValidService"
    expect(seriesData.length).toBeGreaterThan(0);
    
    const unknownItem = seriesData.find(item => item.name === "Unknown");
    expect(unknownItem).toBeDefined();
    expect(unknownItem.value).toBe(100); // 50 + 30 + 20 aggregated
  });

  test("handles ResizeObserver functionality", async () => {
    // Store original ResizeObserver
    const originalRO = global.ResizeObserver;
    
    // Mock ResizeObserver constructor to track calls
    const mockConstructor = vi.fn().mockImplementation(function(callback) {
      this.callback = callback;
      this.observe = vi.fn();
      this.unobserve = vi.fn();
      this.disconnect = vi.fn();
    });
    global.ResizeObserver = mockConstructor;
    
    const costData = {
      monthly_summary: {
        service_wise_costs: [
          { service_name: "Service1", total_cost: 50 },
        ],
        current_month_cost: 50,
      },
    };

    await act(async () => {
      render(
        <CostContext.Provider value={{ costData, loading: false }}>
          <DonutChart />
        </CostContext.Provider>
      );
    });

    // Should render the chart
    expect(screen.getByTestId("react-echarts-mock")).toBeInTheDocument();
    
    // The ResizeObserver constructor should be called during mounting
    expect(mockConstructor).toHaveBeenCalled();
    
    // Restore original ResizeObserver
    global.ResizeObserver = originalRO;
  });

  test("handles ResizeObserver unavailable", async () => {
    // Temporarily remove ResizeObserver
    const originalRO = global.ResizeObserver;
    delete global.ResizeObserver;

    const costData = {
      monthly_summary: {
        service_wise_costs: [
          { service_name: "Service1", total_cost: 50 },
        ],
        current_month_cost: 50,
      },
    };

    await act(async () => {
      render(
        <CostContext.Provider value={{ costData, loading: false }}>
          <DonutChart />
        </CostContext.Provider>
      );
    });

    // Should still render the chart even without ResizeObserver
    expect(screen.getByTestId("react-echarts-mock")).toBeInTheDocument();
    
    // Restore ResizeObserver
    global.ResizeObserver = originalRO;
  });

  test("tests safeFormatter with various input formats", async () => {
    const costData = {
      monthly_summary: {
        service_wise_costs: [
          { service_name: "Service1", total_cost: 50 },
        ],
        current_month_cost: 50,
      },
    };

    await act(async () => {
      render(
        <CostContext.Provider value={{ costData, loading: false }}>
          <DonutChart />
        </CostContext.Provider>
      );
    });

    const option = ReactECharts.__lastOption;
    
    // Get the formatter function from tooltip
    const formatter = option.tooltip.formatter;
    expect(typeof formatter).toBe("function");

    // Test with object params
    const result1 = formatter({ name: "Test", value: 123.456 });
    expect(result1).toBe("Test: $123.46");

    // Test with array params
    const result2 = formatter([{ name: "Test2", value: 78.9 }]);
    expect(result2).toBe("Test2: $78.90");

    // Test with array value format
    const result3 = formatter({ name: "Test3", value: ["Test3", 45.678] });
    expect(result3).toBe("Test3: $45.68");

    // Test with null/undefined values
    const result4 = formatter({ name: "Test4", value: null });
    expect(result4).toBe("Test4: $0.00");

    // Test with invalid values
    const result5 = formatter({ name: "Test5", value: "invalid" });
    expect(result5).toBe("Test5: $0.00");

    // Test error handling with completely invalid input
    const result6 = formatter(undefined);
    expect(result6).toBe(": $0.00");
  });

  test("handles chart resize errors gracefully", async () => {
    const costData = {
      monthly_summary: {
        service_wise_costs: [
          { service_name: "Service1", total_cost: 50 },
        ],
        current_month_cost: 50,
      },
    };

    // Mock a chart instance that throws on resize
    const mockChartRef = {
      current: {
        getEchartsInstance: () => ({
          resize: () => {
            throw new Error("Resize failed");
          },
        }),
      },
    };

    await act(async () => {
      render(
        <CostContext.Provider value={{ costData, loading: false }}>
          <DonutChart ref={mockChartRef} />
        </CostContext.Provider>
      );
    });

    // Should still render the chart despite resize errors
    expect(screen.getByTestId("react-echarts-mock")).toBeInTheDocument();
  });

  test("handles ResizeObserver callback with missing container", async () => {
    // Store original ResizeObserver
    const originalRO = global.ResizeObserver;
    
    let resizeCallback = null;
    const mockConstructor = vi.fn().mockImplementation(function(callback) {
      resizeCallback = callback;
      this.observe = vi.fn();
      this.unobserve = vi.fn();
      this.disconnect = vi.fn();
    });
    global.ResizeObserver = mockConstructor;
    
    const costData = {
      monthly_summary: {
        service_wise_costs: [
          { service_name: "Service1", total_cost: 50 },
        ],
        current_month_cost: 50,
      },
    };

    await act(async () => {
      render(
        <CostContext.Provider value={{ costData, loading: false }}>
          <DonutChart />
        </CostContext.Provider>
      );
    });

    // Should render the chart
    expect(screen.getByTestId("react-echarts-mock")).toBeInTheDocument();
    
    // Simulate resize callback when container is missing
    if (resizeCallback) {
      // Mock containerRef.current to be null
      resizeCallback();
    }
    
    // Restore original ResizeObserver
    global.ResizeObserver = originalRO;
  });
});
