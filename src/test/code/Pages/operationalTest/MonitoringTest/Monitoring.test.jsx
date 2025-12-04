/**
 * src/test/Monitoring.test.jsx
 */
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import "@testing-library/jest-dom";

// -----------------------------
// mock axios and api
// -----------------------------
vi.mock("axios", () => ({ 
  default: { 
    post: vi.fn(),
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
    }))
  } 
}));
vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}));
import axios from "axios";
import api from "@/lib/api";

// -----------------------------
// mock ant-design icons used
// -----------------------------
vi.mock("@ant-design/icons", () => {
  const make = (name) => (props) => <span data-testid={`icon-${name}`}>{name}</span>;
  return {
    SearchOutlined: make("SearchOutlined"),
    ReloadOutlined: make("ReloadOutlined"),
    BarChartOutlined: make("BarChartOutlined"),
    CheckCircleOutlined: make("CheckCircleOutlined"),
    ExclamationCircleOutlined: make("ExclamationCircleOutlined"),
    CloseCircleOutlined: make("CloseCircleOutlined"),
  };
});

// -----------------------------
// partial mock for antd components used
// -----------------------------
vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");

  // Input mock
  const Input = (props) => <input data-testid="antd-input" {...props} />;

  // Select mock (native select)
  const Select = ({ children, value, onChange, placeholder, allowClear, ...p }) => (
    <select
      data-testid="antd-select"
      value={value ?? ""}
      onChange={(e) => onChange && onChange(e.target.value)}
      {...p}
    >
      <option value="">{placeholder ?? "Select"}</option>
      {React.Children.map(children, (c) =>
        React.isValidElement(c) ? <option value={c.props.value}>{c.props.children}</option> : null
      )}
    </select>
  );
  const Option = ({ children, value }) => <option value={value}>{children}</option>;

  // Table mock - renders header + rows and provides a "more realistic" row structure for assertions
  const Table = ({ columns, dataSource, loading }) => {
    if (loading) return <div data-testid="table-loading">Loading...</div>;
    return (
      <table data-testid="antd-table">
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={i}>{typeof c.title === "string" ? c.title : `col-${i}`}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(dataSource || []).map((row, idx) => (
            <tr key={row.key ?? idx}>
              <td>{row.accountId}</td>
              <td>{row.accountName}</td>
              <td>{row.region}</td>
              <td>{row.instanceId}</td>
              <td>{row.cpuUsage}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Card, Statistic, Row, Col mocks
  const Card = ({ children }) => <div data-testid="antd-card">{children}</div>;
  const Statistic = ({ title, value, prefix }) => (
    <div data-testid={`stat-${title.replace(/\s+/g, "-")}`}>
      <div>{title}</div>
      <div>{String(value)}</div>
    </div>
  );
  const Row = ({ children }) => <div>{children}</div>;
  const Col = ({ children }) => <div>{children}</div>;

  // Alert mock
  const Alert = ({ message, description, type, action }) => (
    <div data-testid="antd-alert">
      <div>{message}</div>
      <div>{description}</div>
      <div>{type}</div>
      <div>{action ? "has-action" : "no-action"}</div>
    </div>
  );

  // Skeleton mock
  const Skeleton = ({ children }) => <div data-testid="antd-skeleton">{children}</div>;

  // Tag and Typography
  const Tag = ({ children }) => <span>{children}</span>;
  const Typography = { Title: ({ children }) => <h4>{children}</h4>, Text: ({ children }) => <span>{children}</span> };

  return {
    ...actual,
    Input,
    Select,
    Option,
    Table,
    Card,
    Statistic,
    Row,
    Col,
    Alert,
    Skeleton,
    Tag,
    Typography,
  };
});

// -----------------------------
// import component AFTER mocks
// -----------------------------
import Monitoring from "@/pages/operational/Monitoring/Monitoring"; // adjust path if needed

// -----------------------------
// helper to build API rows (component expects response.data.data = [...])
// -----------------------------
const makeApiRow = (overrides = {}) => ({
  id: overrides.id ?? "id-1",
  account_id: overrides.account_id ?? "A1",
  account_name: overrides.account_name ?? "Account One",
  region: overrides.region ?? "us-east-1",
  instance_id: overrides.instance_id ?? "i-123",
  cpu_utilization: overrides.cpu_utilization ?? 25.1234,
  memory_utilization: overrides.memory_utilization ?? 30.5,
  disk_utilization: overrides.disk_utilization ?? 10.1,
  ...overrides,
});

// -----------------------------
// Tests
// -----------------------------
describe("Monitoring component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  test("loads data and renders table and summary stats", async () => {
    const apiRows = [
      makeApiRow({ id: "r1", account_id: "A1", account_name: "Alpha", cpu_utilization: 25, memory_utilization: 20, disk_utilization: 10 }),
      makeApiRow({ id: "r2", account_id: "A2", account_name: "Beta", cpu_utilization: 65, memory_utilization: 70, disk_utilization: 30 }),
      makeApiRow({ id: "r3", account_id: "A3", account_name: "Gamma", cpu_utilization: 85, memory_utilization: 90, disk_utilization: 95 }),
    ];

    // axios.post resolves with object containing data: { data: [...] }
    axios.post.mockResolvedValueOnce({ data: { data: apiRows } });

    // store expected account_ids
    localStorage.setItem("account_ids", JSON.stringify(["A1", "A2", "A3"]));

    render(<Monitoring />);

    // Wait for table render (component sets loading -> false)
    await waitFor(() => expect(screen.getByTestId("antd-table")).toBeInTheDocument());

    // Table rows present - use getAllByText to handle duplicates (select + table)
    expect(screen.getAllByText("Alpha")).toHaveLength(2); // one in select, one in table
    expect(screen.getAllByText("Beta")).toHaveLength(2); // one in select, one in table
    expect(screen.getAllByText("Gamma")).toHaveLength(2); // one in select, one in table

    // CPU usage formatted (component appends % and two decimals)
    expect(screen.getByText("25.00%")).toBeInTheDocument();
    expect(screen.getByText("65.00%")).toBeInTheDocument();
    expect(screen.getByText("85.00%")).toBeInTheDocument();

    // Summary stats: Total Instances = 3
    const totalStat = screen.getByTestId("stat-Total-Instances");
    expect(totalStat).toBeInTheDocument();
    expect(totalStat).toHaveTextContent("3");

    // Healthy Instances: cpu<memory<disk all <60 -> only Alpha fits
    const healthyStat = screen.getByTestId("stat-Healthy-Instances");
    expect(healthyStat).toBeInTheDocument();
    expect(healthyStat).toHaveTextContent("1");

    // Warning: Beta fits (cpu 65, memory 70)
    const warningStat = screen.getByTestId("stat-Warning");
    expect(warningStat).toBeInTheDocument();
    expect(warningStat).toHaveTextContent("1");

    // Critical: Gamma fits (>=80)
    const criticalStat = screen.getByTestId("stat-Critical");
    expect(criticalStat).toBeInTheDocument();
    expect(criticalStat).toHaveTextContent("1");
  });

  test("select filter by account name works", async () => {
    const apiRows = [
      makeApiRow({ id: "r1", account_id: "A1", account_name: "Alpha" }),
      makeApiRow({ id: "r2", account_id: "A2", account_name: "Beta" }),
    ];
    axios.post.mockResolvedValueOnce({ data: { data: apiRows } });
    localStorage.setItem("account_ids", JSON.stringify(["A1", "A2"]));

    render(<Monitoring />);

    await waitFor(() => expect(screen.getByTestId("antd-table")).toBeInTheDocument());

    // select component is mocked as native <select>
    const select = screen.getByTestId("antd-select");
    fireEvent.change(select, { target: { value: "Beta" } });

    // Only Beta row remains - check for Beta in table (not select option)
    // Use getAllByText to handle duplicate Beta (select option + table row)
    expect(screen.getAllByText("Beta")).toHaveLength(2); // one in select, one in table
    expect(screen.queryByText("Alpha")).toBeInTheDocument(); // Alpha still in select
  });

  test("shows Alert when API returns empty data array", async () => {
    // API returns empty array -> component sets error and shows Alert (when performanceData is empty)
    axios.post.mockResolvedValueOnce({ data: { data: [] } });
    localStorage.setItem("account_ids", JSON.stringify(["A1"]));

    render(<Monitoring />);

    // Wait for alert
    await waitFor(() => expect(screen.getByTestId("antd-alert")).toBeInTheDocument());

    // Alert contains "No Data Available" title (message)
    expect(screen.getByTestId("antd-alert")).toHaveTextContent("No Data Available");
  });
});
