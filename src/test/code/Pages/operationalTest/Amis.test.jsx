/**
 * src/test/Amis.test.jsx
 */
import React from "react";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import { vi } from "vitest";
import "@testing-library/jest-dom";

// Mock window.matchMedia for Ant Design responsive observer
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
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
// mock axios with create method and interceptors
// -----------------------------
vi.mock("axios", () => ({
  default: { 
    post: vi.fn(),
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      interceptors: {
        request: {
          use: vi.fn(),
        },
        response: {
          use: vi.fn(),
        },
      },
    })),
    interceptors: {
      request: {
        use: vi.fn(),
      },
      response: {
        use: vi.fn(),
      },
    },
  }
}));
import axios from "axios";

// -----------------------------
// mock ant-design icons (simple spans that propagate onClick)
// -----------------------------
vi.mock("@ant-design/icons", () => {
  const make = (name) => (props) => <span data-testid={`icon-${name}`} {...props}>{name}</span>;
  return {
    EyeOutlined: make("EyeOutlined"),
    InfoCircleOutlined: make("InfoCircleOutlined"),
    SearchOutlined: make("SearchOutlined"),
  };
});

// -----------------------------
// partial mock for antd (Table mock executes columns[].render so action handlers work)
// -----------------------------
vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");

  // Input mock
  const Input = (props) => <input data-testid="antd-input" {...props} />;

  // Table mock: executes columns[].render for each row so onClick handlers inside render fire component handlers
  const Table = ({ columns = [], dataSource = [], loading }) => {
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
          {dataSource.map((row, rowIndex) => (
            <tr key={row.snapshot_id ?? `${rowIndex}`}>
              {columns.map((col, colIndex) => {
                // If column has a dataIndex, render that first
                if (col.render && typeof col.render === "function") {
                  // call the render with (value, record, index)
                  try {
                    const rendered = col.render(row[col.dataIndex], row, rowIndex);
                    // Ensure React element or primitive is returned
                    return <td key={colIndex}>{rendered}</td>;
                  } catch (e) {
                    // If render throws, fallback to simple text
                    return <td key={colIndex}>ERR</td>;
                  }
                }
                if (col.dataIndex) {
                  return <td key={colIndex}>{String(row[col.dataIndex] ?? "")}</td>;
                }
                return <td key={colIndex}></td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Modal mock: render children when open is true
  const Modal = ({ open, children }) => (open ? <div data-testid="antd-modal">{children}</div> : null);

  // Tag and Tooltip, Descriptions, Card, Row, Col, Typography simple mocks
  const Tag = ({ children }) => <span data-testid="antd-tag">{children}</span>;
  const Tooltip = ({ children }) => <span>{children}</span>;
  const Descriptions = ({ children }) => <div>{children}</div>;
  Descriptions.Item = ({ children }) => <div>{children}</div>;
  const Card = ({ children }) => <div>{children}</div>;
  const Row = ({ children }) => <div>{children}</div>;
  const Col = ({ children }) => <div>{children}</div>;
  const Typography = { Title: ({ children }) => <h4>{children}</h4> };

  return {
    ...actual,
    Input,
    Table,
    Modal,
    Tag,
    Tooltip,
    Descriptions,
    Card,
    Row,
    Col,
    Typography,
  };
});

// -----------------------------
// import component AFTER mocks
// -----------------------------
import Amis from "@/pages/operational/Amis"; // adjust path if needed

// -----------------------------
// helper: sample AMI rows (structure matches component expectations)
// -----------------------------
const makeRow = (overrides = {}) => ({
  owner_id: "111111111111",
  ami_name: "ami-test-01",
  age_in_days: 45,
  image_state: "available",
  region: "us-east-1",
  platform: "linux",
  usage_count: 3,
  ami_id: "ami-abc123",
  aws_account: "aws-111",
  architecture: "x86_64",
  encrypted: false,
  description: "Test AMI",
  snapshot_id: "snp-1",
  ...overrides,
});

// -----------------------------
// Tests
// -----------------------------
describe("Amis component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  test("renders table after API returns AMIs", async () => {
    const rows = [makeRow(), makeRow({ ami_name: "ami-two", owner_id: "222222222222" })];
    axios.post.mockResolvedValueOnce({ data: rows });

    // store account_ids expected by component
    localStorage.setItem("account_ids", JSON.stringify(["111111111111", "222222222222"]));

    render(<Amis />);

    // Wait for table
    await waitFor(() => expect(screen.getByTestId("antd-table")).toBeInTheDocument());

    // Check AMI names present
    expect(screen.getByText("ami-test-01")).toBeInTheDocument();
    expect(screen.getByText("ami-two")).toBeInTheDocument();

    // Age rendering uses "days" (multiple elements, so use getAllByText)
    expect(screen.getAllByText(/45 days/i)).toHaveLength(2);
  });

  test("search filters table rows by AMI name", async () => {
    const rows = [makeRow({ ami_name: "alpha-ami" }), makeRow({ ami_name: "beta-ami" })];
    axios.post.mockResolvedValueOnce({ data: rows });
    localStorage.setItem("account_ids", JSON.stringify(["111111111111"]));

    render(<Amis />);

    await waitFor(() => expect(screen.getByTestId("antd-table")).toBeInTheDocument());

    const input = screen.getByTestId("antd-input");
    fireEvent.change(input, { target: { value: "alpha" } });

    expect(screen.getByText("alpha-ami")).toBeInTheDocument();
    expect(screen.queryByText("beta-ami")).not.toBeInTheDocument();
  });

  test("opens modal when clicking Eye icon (More Details)", async () => {
    const rows = [makeRow({ ami_name: "open-ami", owner_id: "333333333333", account_name: "Test Account" })];
    axios.post.mockResolvedValueOnce({ data: rows });
    localStorage.setItem("account_ids", JSON.stringify(["333333333333"]));

    render(<Amis />);

    // wait table
    await waitFor(() => expect(screen.getByTestId("antd-table")).toBeInTheDocument());

    // Find the Eye icon element rendered by the column.render; icon has data-testid="icon-EyeOutlined"
    const eyeIcons = screen.getAllByTestId("icon-EyeOutlined");
    // click the first eye icon
    fireEvent.click(eyeIcons[0]);

    // modal should appear
    await waitFor(() => expect(screen.getByTestId("antd-modal")).toBeInTheDocument());

    // modal should contain AMI ID (check within modal)
    const modal = screen.getByTestId("antd-modal");
    expect(within(modal).getByText("ami-abc123")).toBeInTheDocument();
  });

  test("handles API error gracefully (still shows title)", async () => {
    axios.post.mockRejectedValueOnce(new Error("Network Down"));
    localStorage.setItem("account_ids", JSON.stringify(["111111111111"]));

    render(<Amis />);

    // component should still render title even when API fails
    await waitFor(() => expect(screen.getByText(/AMI/i)).toBeInTheDocument());
  });
});
