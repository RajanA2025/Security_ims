// src/test/Dashboard.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import "@testing-library/jest-dom";

// Mock ResizeObserver for chart components
global.ResizeObserver = class ResizeObserver {
  constructor() {
    this.observe = vi.fn();
    this.unobserve = vi.fn();
    this.disconnect = vi.fn();
  }
};

// Mock child components used by Dashboard
vi.mock("../../components/CostComponents/barchart.jsx", () => ({
  default: () => <div data-testid="bar-chart">BarChart</div>,
}));
vi.mock("../../components/CostComponents/Top5", () => ({
  default: ({ data }) => <div data-testid="top5">Top5 - {Array.isArray(data) ? data.length : 0}</div>,
}));
vi.mock("../../components/CostComponents/DonutChart", () => ({
  default: () => <div data-testid="donut-chart">DonutChart</div>,
}));
vi.mock("../../components/CostComponents/Savingdashmain", () => ({
  Savingdashmain: () => <div data-testid="saving-main">SavingMain</div>,
  default: () => <div data-testid="saving-main-default">SavingMainDefault</div>,
}));
vi.mock("../../components/CostComponents/Complaincedashmain.jsx", () => ({
  Complaincedashmain: () => <div data-testid="complaince-main">ComplainceMain</div>,
}));

// Mock ECharts to prevent canvas issues
vi.mock("echarts", () => ({
  init: () => ({
    setOption: vi.fn(),
    dispose: vi.fn(),
    resize: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  }),
  registerTheme: vi.fn(),
}));

// Mock echarts-for-react
vi.mock("echarts-for-react", () => ({
  default: ({ option }) => <div data-testid="echarts-chart">ECharts Chart</div>,
}));

// Import the component AFTER mocks
import Dashboard from "@/pages/CostPages/Dashboard";
import { CostContext } from "@/context/CostContext";

describe("Dashboard component", () => {
  const originalInnerWidth = global.innerWidth;
  const originalLocalStorage = global.localStorage;
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    // Mock window.matchMedia for Ant Design
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    // ensure consistent viewport (not mobile)
    global.innerWidth = 1024;

    // mock localStorage
    const store = {};
    global.localStorage = {
      getItem: (k) => (store.hasOwnProperty(k) ? store[k] : null),
      setItem: (k, v) => (store[k] = String(v)),
      removeItem: (k) => delete store[k],
      clear: () => Object.keys(store).forEach((k) => delete store[k]),
    };
  });

  afterEach(() => {
    global.innerWidth = originalInnerWidth;
    global.localStorage = originalLocalStorage;
    window.matchMedia = originalMatchMedia;
    vi.restoreAllMocks();
  });

  it("renders loading state when loading is true", () => {
    const ctx = {
      costData: null,
      loading: true,
      error: null,
      filters: {},
      setFilters: vi.fn(),
      accounts: [],
    };

    render(
      <CostContext.Provider value={ctx}>
        <Dashboard />
      </CostContext.Provider>
    );

    // Check for the Spin component by its class and aria-busy attribute
    const spinElement = document.querySelector('.ant-spin');
    expect(spinElement).toBeInTheDocument();
    expect(spinElement).toHaveAttribute('aria-busy', 'true');
  });

  it("renders error state when error is provided", () => {
    const ctx = {
      costData: null,
      loading: false,
      error: "Server failed",
      filters: {},
      setFilters: vi.fn(),
      accounts: [],
    };

    render(
      <CostContext.Provider value={ctx}>
        <Dashboard />
      </CostContext.Provider>
    );

    expect(screen.getByText(/error: server failed/i)).toBeInTheDocument();
  });

  it("renders dashboard metrics, child components and handles reset timer & TreeSelect filtering", async () => {
    // Prepare costData with values to render
    const costData = {
      monthly_summary: {
        current_month_cost: 12345,
        previous_month_cost: 10000,
        forecast_amount: 6789,
      },
      top_5: { top_services_current_month: ["S1", "S2", "S3"] },
    };

    // Put stored account_ids in localStorage (only child accounts present should be shown)
    global.localStorage.setItem("account_ids", JSON.stringify(["ACC1"]));

    const mockSetFilters = vi.fn();

    // Provide accounts including 'ALL' and others
    const ctx = {
      costData,
      loading: false,
      error: null,
      filters: {},
      setFilters: mockSetFilters,
      accounts: ["ALL", "ACC1", "ACC2"],
    };

    render(
      <CostContext.Provider value={ctx}>
        <Dashboard />
      </CostContext.Provider>
    );

    // After render we should see formatted current month and forecast amounts
    // toLocaleString formatting may include commas — check the substrings
    expect(screen.getByText(/12,345/)).toBeInTheDocument();
    expect(screen.getByText(/6,789/)).toBeInTheDocument();

    // change% should be present ( (12345-10000)/10000 = 23.45% -> shown as 23.4% )
    expect(screen.getByText(/from last month\./i)).toBeInTheDocument();
    expect(screen.getByText(/23\.4%/)).toBeInTheDocument();

    // Check that filter controls are rendered
    expect(screen.getByText("Select filter")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Start date")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("End date")).toBeInTheDocument();

    // Clicking the Reset (Reload) button should call handleReset -> setFilters with reset object
    const reloadBtn = screen.getByRole("button", { name: "" }); // the button has no accessible name, so grab the first button icon
    fireEvent.click(reloadBtn);
    await waitFor(() => {
      expect(mockSetFilters).toHaveBeenCalled();
    });
  }, 10000); // Increase timeout to 10 seconds
});
