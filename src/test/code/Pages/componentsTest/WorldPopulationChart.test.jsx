// CpuUsageChart.test.jsx
import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { vi } from "vitest";

// -----------------------------
// Mock recharts so tests are deterministic
// -----------------------------
vi.mock("recharts", () => {
  const React = require("react");

  // ResponsiveContainer simply renders its children for tests
  const ResponsiveContainer = ({ children }) => <div data-testid="responsive">{children}</div>;

  // BarChart: render a simple list of bars using the provided `data` prop
  const BarChart = ({ data = [] }) => (
    <div data-testid="barchart" data-data={JSON.stringify(data)}>
      {data.map((d, i) => (
        <div
          key={i}
          data-testid="bar-item"
          data-name={d.name}
          data-value={String(d["CPU Usage"])}
        />
      ))}
    </div>
  );

  // Minimal stubs for other Recharts exports used in the component
  const Bar = () => <div data-testid="recharts-bar" />;
  const XAxis = () => <div data-testid="recharts-xaxis" />;
  const YAxis = () => <div data-testid="recharts-yaxis" />;
  const CartesianGrid = () => <div data-testid="recharts-grid" />;
  const Tooltip = () => <div data-testid="recharts-tooltip" />;
  const Legend = () => <div data-testid="recharts-legend" />;

  return {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
  };
});

// -----------------------------
// Import component after mocks
// -----------------------------
import CpuUsageChart from "c:/project/jit_ms1/Security_ims/src/components/WorldPopulationChart.jsx";

describe("CpuUsageChart", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  test("shows empty state when no data provided", () => {
    render(<CpuUsageChart data={[]} filters={{}} />);

    // When no data, component renders a fallback message
    expect(screen.getByText(/No CPU usage data available/i)).toBeInTheDocument();
  });

  test("renders account-level averages when filters are not set", () => {
    const mockData = [
      { accountId: "A1", accountName: "Alpha", cpuUsage: "10%" },
      { accountId: "A1", accountName: "Alpha", cpuUsage: "30%" },
      { accountId: "B2", accountName: "Beta", cpuUsage: "50%" },
    ];

    render(<CpuUsageChart data={mockData} filters={{}} />);

    // Heading should indicate account-level view
    expect(screen.getByText(/Average CPU Usage by Account/i)).toBeInTheDocument();

    // Bars should be rendered for each account (Alpha, Beta) => 2 bar items
    const bars = screen.getAllByTestId("bar-item");
    expect(bars.length).toBe(2);

    // Validate computed average for "Alpha": (10 + 30) / 2 = 20
    const alphaBar = bars.find((b) => b.getAttribute("data-name") === "Alpha");
    expect(alphaBar).toBeTruthy();
    expect(alphaBar.getAttribute("data-value")).toBe("20");
    
    // Validate Beta average = 50
    const betaBar = bars.find((b) => b.getAttribute("data-name") === "Beta");
    expect(betaBar).toBeTruthy();
    expect(betaBar.getAttribute("data-value")).toBe("50");
  });

  test("renders instance-level bars when both accountId and region filters are provided", () => {
    const mockData = [
      { accountId: "A1", accountName: "Alpha", region: "us-east-1", instanceId: "i-1", cpuUsage: "12%" },
      { accountId: "A1", accountName: "Alpha", region: "us-east-1", instanceId: "i-2", cpuUsage: "38%" },
      { accountId: "A1", accountName: "Alpha", region: "us-west-2", instanceId: "i-3", cpuUsage: "44%" },
    ];

    // Filters target account A1 and region us-east-1 -> should show two instance bars
    render(<CpuUsageChart data={mockData} filters={{ accountId: "A1", region: "us-east-1" }} />);

    // Heading should indicate instance-level view
    expect(screen.getByText(/Instance CPU Usage/i)).toBeInTheDocument();

    const bars = screen.getAllByTestId("bar-item");
    expect(bars.length).toBe(2);

    const names = bars.map((b) => b.getAttribute("data-name"));
    expect(names).toContain("i-1");
    expect(names).toContain("i-2");

    const values = bars.map((b) => Number(b.getAttribute("data-value")));
    expect(values).toEqual(expect.arrayContaining([12, 38]));
  });

  test("handles numeric cpuUsage values as numbers (no % sign)", () => {
    const mockData = [
      { accountId: "C1", accountName: "Gamma", cpuUsage: 25 },
      { accountId: "C1", accountName: "Gamma", cpuUsage: 35 },
    ];

    render(<CpuUsageChart data={mockData} filters={{}} />);

    // Should aggregate to a single account bar with average (25+35)/2 = 30
    const bars = screen.getAllByTestId("bar-item");
    expect(bars.length).toBe(1);

    const gammaBar = bars[0];
    expect(gammaBar.getAttribute("data-name")).toBe("Gamma");
    expect(gammaBar.getAttribute("data-value")).toBe("30");
  });

});
