/**
 * src/test/Dashboard.test.jsx
 */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
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

// -----------------------------
// mock observability context BEFORE component import
// -----------------------------
vi.mock("@/Context/ObservabilityContext", () => ({
  useObservability: vi.fn(() => ({
    securityData: [],
    eipData: [],
    volumeData: [],
    s3Data: [],
    ec2Data: []
  }))
}));

// -----------------------------
// mock axios
// -----------------------------
vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    }))
  }
}));
import axios from "axios";

// -----------------------------
// mock chart components so tests can inspect props (simple render)
// -----------------------------
vi.mock("../../components/dashboard/chart", () => {
  return ({ labels, data, title }) => (
    <div data-testid="mock-chart">
      {title} - labels:{JSON.stringify(labels)} data:{JSON.stringify(data)}
    </div>
  );
});
vi.mock("../../components/dashboard/donutchart", () => () => <div data-testid="mock-donut" />);
vi.mock("../../components/dashboard/halfpiechart", () => () => <div data-testid="mock-halfpie" />);

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

// -----------------------------
// mock framer-motion to eliminate animation overhead
// -----------------------------
vi.mock("framer-motion", () => {
  const React = require("react");
  const motion = {
    div: (props) => React.createElement("div", props, props.children),
    h1: (props) => React.createElement("h1", props, props.children),
    p: (props) => React.createElement("p", props, props.children),
  };
  const AnimatePresence = ({ children }) => children;
  
  return {
    motion,
    AnimatePresence,
  };
});

// -----------------------------
// mock antd (minimal pieces used) and icons
// -----------------------------
vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  const Card = ({ children, ...p }) => <div data-testid="antd-card" {...p}>{children}</div>;
  const Row = ({ children }) => <div>{children}</div>;
  const Col = ({ children }) => <div>{children}</div>;
  const Tooltip = ({ children, title }) => <span title={title}>{children}</span>;
  const Typography = { Title: ({ children }) => <h4>{children}</h4> };

  return {
    ...actual,
    Card,
    Row,
    Col,
    Tooltip,
    Typography
  };
});
vi.mock("@ant-design/icons", () => {
  const make = (name) => (props) => <span data-testid={`icon-${name}`}>{name}</span>;
  return {
    BarChartOutlined: make("BarChartOutlined"),
    CheckCircleOutlined: make("CheckCircleOutlined"),
    ExclamationCircleOutlined: make("ExclamationCircleOutlined"),
    CloseCircleOutlined: make("CloseCircleOutlined"),
    InfoCircleOutlined: make("InfoCircleOutlined")
  };
});

// -----------------------------
// import component AFTER mocks
// -----------------------------
import Dashboard from "@/pages/operational/Dashboard"; // adjust path if needed

// -----------------------------
// Helpers
// -----------------------------
const makeApiItem = (overrides = {}) => ({
  id: overrides.id ?? "id-1",
  account_id: overrides.account_id ?? "A1",
  cpu_utilization: typeof overrides.cpu_utilization === "number" ? overrides.cpu_utilization : 10,
  memory_utilization: typeof overrides.memory_utilization === "number" ? overrides.memory_utilization : 10,
  disk_utilization: typeof overrides.disk_utilization === "number" ? overrides.disk_utilization : 10,
  ...overrides
});

// -----------------------------
// Tests
// -----------------------------
describe("Dashboard component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  test("shows loading state while fetching", async () => {
    // make axios.post return a promise that resolves later
    const promise = new Promise((res) => setTimeout(() => res({ data: { data: [] } }), 50));
    axios.post.mockReturnValueOnce(promise);

    render(<Dashboard />);

    // loading state text shown by LoadingState
    expect(screen.getByText(/Loading dashboard data/i)).toBeInTheDocument();

    // wait for promise to resolve so test cleanup is stable
    await waitFor(() => promise);
  });

  test("renders stat cards and charts after successful fetch", async () => {
    // Create 3 rows: healthy (10/10/10), warning (65/50/50), critical (85/85/85)
    const apiRows = [
      makeApiItem({ id: "r1", cpu_utilization: 10, memory_utilization: 10, disk_utilization: 10 }),
      makeApiItem({ id: "r2", cpu_utilization: 65, memory_utilization: 50, disk_utilization: 50 }),
      makeApiItem({ id: "r3", cpu_utilization: 85, memory_utilization: 85, disk_utilization: 85 })
    ];

    // axios returns { data: { data: [...] } } as component expects
    axios.post.mockResolvedValueOnce({ data: { data: apiRows } });

    // provide observability context data by re-mocking the module for this test
    vi.doMock("@/Context/ObservabilityContext", () => {
      return {
        useObservability: () => ({
          securityData: [{ status: "Orphaned" }, { status: "Active" }],
          eipData: [1],
          volumeData: [1, 2],
          s3Data: [1, 2, 3],
          ec2Data: [{ state: "running" }, { state: "stopped" }, { state: "running" }]
        })
      };
    });

    // re-import Dashboard to pick up the new mock (node module cache)
    const { default: DashboardWithObs } = await import("@/pages/operational/Dashboard");

    // set account ids expected by the component
    localStorage.setItem("account_ids", JSON.stringify(["A1"]));

    render(<DashboardWithObs />);

    // wait for table/chart area to appear (loading -> false)
    await waitFor(() => {
      // stat titles exist
      expect(screen.getByText(/Total Instances/i)).toBeInTheDocument();
    });

    // totalInstances = 3
    expect(screen.getByText("3")).toBeInTheDocument();

    // healthyInstances = 1, warningInstances = 1, criticalInstances = 1
    // The AnimatedStatCard renders numbers as text, so look for specific combinations
    expect(screen.getByText("3")).toBeInTheDocument(); // Total instances
    expect(screen.getAllByText("1")).toHaveLength(3); // Three stats with value 1

    // Check that observability and snapshot sections are rendered
    expect(screen.getByText("Observability")).toBeInTheDocument();
    expect(screen.getByText("Snapshot")).toBeInTheDocument();

    // ensure axios was called with the expected POST payload
    expect(axios.post).toHaveBeenCalled();
    const calledWith = axios.post.mock.calls[0];
    expect(calledWith[0]).toContain("/performance/filter");
    // payload should include account_ids array (we set localStorage to ["A1"])
    expect(calledWith[1]).toMatchObject({ account_ids: ["A1"] });
  });

  test("handles empty performance response gracefully (loading false)", async () => {
    // axios returns empty data object
    axios.post.mockResolvedValueOnce({ data: { data: [] } });

    render(<Dashboard />);

    // after fetch completes, loading false and stat cards render (values zero)
    await waitFor(() => expect(screen.getByText(/Total Instances/i)).toBeInTheDocument());

    // totalInstances should be 0
    expect(screen.getAllByText("0")).toHaveLength(4); // Four zeros are rendered for different stats
  });
});
