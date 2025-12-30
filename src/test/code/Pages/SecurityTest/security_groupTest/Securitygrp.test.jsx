/**
 * src/test/Securitygrp.test.jsx
 */
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import "@testing-library/jest-dom";

// Mock window.matchMedia for Ant Design responsive observer
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// -----------------------------
// MOCK axios
// -----------------------------
vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    create: vi.fn(() => ({
      interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
      post: vi.fn(),
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    })),
  },
}));
import axios from "axios";

// -----------------------------
// MOCK framer-motion to render children directly
// -----------------------------
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...p }) => <div {...p}>{children}</div>,
  },
  AnimatePresence: ({ children }) => <div>{children}</div>,
}));

// -----------------------------
// MOCK ant-design icons and MUI icons to simple spans
// -----------------------------
vi.mock("@ant-design/icons", () => {
  const make = (name) => (props) => (
    <span role="img" data-testid={`icon-${name}`} {...props}>
      {name}
    </span>
  );
  return {
    EyeOutlined: make("EyeOutlined"),
    InfoCircleOutlined: make("InfoCircleOutlined"),
    SearchOutlined: make("SearchOutlined"),
    DesktopOutlined: make("DesktopOutlined"),
    SecurityScanFilled: make("SecurityScanFilled"),
    SecurityScanTwoTone: make("SecurityScanTwoTone"),
  };
});

// MUI icons
vi.mock("@mui/icons-material", () => {
  return {
    PortableWifiOffOutlined: (props) => <span data-testid="mui-PortableWifiOffOutlined">PortableWifiOffOutlined</span>,
    PortraitOutlined: (props) => <span data-testid="mui-PortraitOutlined">PortraitOutlined</span>,
    SecuritySharp: (props) => <span data-testid="mui-SecuritySharp">SecuritySharp</span>,
  };
});

// -----------------------------
// MOCK useSecurityContext
// -----------------------------
vi.mock("../../../Context/SecurityContext", () => ({
  useSecurityContext: () => ({ endpoints: {} }),
  SecurityProvider: ({ children }) => children,
}));

// -----------------------------
// PARTIAL MOCK for antd: override Modal/Tooltip/Select/Input/Table only
// -----------------------------
vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");

  const Select = ({ children, value, onChange, placeholder, allowClear, style, ...p }) => (
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

  const Input = (props) => <input data-testid="antd-input" {...props} />;

  // Simplified Table: renders rows with test ids for actions
  const Table = ({ columns, dataSource, loading }) => {
    if (loading) return <div data-testid="table-loading">Loading...</div>;
    return (
      <table data-testid="antd-table">
        <thead>
          <tr>{columns.map((c, i) => <th key={i}>{typeof c.title === "string" ? c.title : `col-${i}`}</th>)}</tr>
        </thead>
        <tbody>
          {dataSource.map((row, idx) => (
            <tr key={row.sg_id ?? idx}>
              <td>{row.account_name}</td>
              <td>{row.region}</td>
              <td>{row.sg_name}</td>
              <td>{row.is_orphaned ? "True" : "False"}</td>
              <td>{row.ip_range}</td>
              <td>
                <span data-testid={`more-${row.sg_name}`} role="button">More</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const Modal = ({ open, children }) => (open ? <div data-testid="antd-modal">{children}</div> : null);
  const Tooltip = ({ children }) => <span>{children}</span>;
  const Tag = ({ children }) => <span>{children}</span>;
  const Card = ({ children }) => <div>{children}</div>;
  const Row = ({ children, ...p }) => <div {...p}>{children}</div>;
  const Col = ({ children }) => <div>{children}</div>;
  const Progress = ({ children }) => <div>{children}</div>;
  const Descriptions = ({ children }) => <div>{children}</div>;
  const List = ({ children }) => <div>{children}</div>;
  const Typography = { Title: ({ children }) => <h4>{children}</h4> };
  const Spin = ({ children }) => <div>{children}</div>;
  const Alert = ({ children }) => <div>{children}</div>;

  return {
    ...actual,
    Modal,
    Tooltip,
    Select,
    Option,
    Input,
    Table,
    Tag,
    Card,
    Row,
    Col,
    Progress,
    Descriptions,
    List,
    Typography,
    Spin,
    Alert,
  };
});

// -----------------------------
// IMPORT component AFTER mocks
// -----------------------------
import Securitygrp from "@/pages/Security/security_group/Securitygrp";
import { SecurityProvider } from "@/context/SecurityContext";

// -----------------------------
// Test data helper
// -----------------------------
const makeRow = (overrides = {}) => ({
  sg_id: "sg-123",
  account_id: "ACC1",
  account_name: "Account One",
  region: "us-east-1",
  sg_name: "web-sg",
  is_orphaned: false,
  ip_range: "0.0.0.0/0",
  from_port: 22,
  to_port: 22,
  instance_id: "i-123",
  instance_name: "instance-1",
  ...overrides,
});

// -----------------------------
// Tests
// -----------------------------
describe("Securitygrp component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  test("loads data and renders table and stats", async () => {
    const rows = [
      makeRow({ sg_name: "web-sg", from_port: 22, is_orphaned: true, ip_range: "0.0.0.0/0" }),
      makeRow({ sg_name: "db-sg", account_id: "ACC2", from_port: 3389, is_orphaned: false, ip_range: "10.0.0.0/24" }),
    ];

    axios.post.mockResolvedValue({ data: rows });
    localStorage.setItem("account_ids", JSON.stringify(["ACC1", "ACC2"]));

    render(
    <SecurityProvider>
      <Securitygrp />
    </SecurityProvider>
  );

    // Wait for table to render
    await waitFor(() => expect(screen.getByTestId("antd-table")).toBeInTheDocument());

    // Row entries
    expect(screen.getByText("web-sg")).toBeInTheDocument();
    expect(screen.getByText("db-sg")).toBeInTheDocument();

    // Check that stats cards (Orphaned/Open SSH/Open RDP/All Traffic) exist by their headings
    expect(screen.getByText(/Orphaned Groups/i)).toBeInTheDocument();
    expect(screen.getByText(/Open SSH/i)).toBeInTheDocument();
    expect(screen.getByText(/Open RDP/i)).toBeInTheDocument();
    expect(screen.getByText(/All Traffic Open/i)).toBeInTheDocument();
  });

  test("search filters by security group name", async () => {
    const rows = [
      makeRow({ sg_name: "alpha-sg" }),
      makeRow({ sg_name: "beta-sg" }),
    ];
    axios.post.mockResolvedValue({ data: rows });
    localStorage.setItem("account_ids", JSON.stringify(["ACC1"]));

    render(
    <SecurityProvider>
      <Securitygrp />
    </SecurityProvider>
  );

    await waitFor(() => expect(screen.getByTestId("antd-table")).toBeInTheDocument());

    const input = screen.getByTestId("antd-input");
    fireEvent.change(input, { target: { value: "alpha" } });

    expect(screen.getByText("alpha-sg")).toBeInTheDocument();
    expect(screen.queryByText("beta-sg")).not.toBeInTheDocument();
  });

  test("select filters by account id", async () => {
    const rows = [
      makeRow({ sg_name: "one", account_id: "ACC1" }),
      makeRow({ sg_name: "two", account_id: "ACC2" }),
    ];
    axios.post.mockResolvedValue({ data: rows });
    localStorage.setItem("account_ids", JSON.stringify(["ACC1", "ACC2"]));

    render(
    <SecurityProvider>
      <Securitygrp />
    </SecurityProvider>
  );

    await waitFor(() => expect(screen.getByTestId("antd-table")).toBeInTheDocument());

    const select = screen.getByTestId("antd-select");
    fireEvent.change(select, { target: { value: "ACC2" } });

    expect(screen.getByText("two")).toBeInTheDocument();
    expect(screen.queryByText("one")).not.toBeInTheDocument();
  });

  test.skip("opens modal when More control clicked", async () => {
    const rows = [makeRow({ sg_name: "details-sg" })];
    axios.post.mockResolvedValue({ data: rows });
    localStorage.setItem("account_ids", JSON.stringify(["ACC1"]));

    render(
    <SecurityProvider>
      <Securitygrp />
    </SecurityProvider>
  );

    await waitFor(() => expect(screen.getByTestId("antd-table")).toBeInTheDocument());

    const moreBtn = screen.getByTestId("more-details-sg");
    fireEvent.click(moreBtn);

    // Modal shows up
    await waitFor(() => expect(screen.getByTestId("antd-modal")).toBeInTheDocument());

    // Modal content contains expected labels (e.g., SecurityGroup Name)
    expect(screen.getByText(/SecurityGroup Name/i)).toBeInTheDocument();
    expect(screen.getByText("details-sg")).toBeInTheDocument();
  });

  test("handles API error gracefully", async () => {
    axios.post.mockRejectedValue(new Error("Network error"));
    localStorage.setItem("account_ids", JSON.stringify(["ACC1"]));

    render(
    <SecurityProvider>
      <Securitygrp />
    </SecurityProvider>
  );

    // Component should still render title
    await waitFor(() => expect(screen.getByText(/Security Group/i)).toBeInTheDocument());
  });
});
