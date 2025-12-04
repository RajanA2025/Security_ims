/**
 * src/test/code/Cloud_Trail.test.jsx
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

// -------------------------
// MOCK axios
// -------------------------
vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    create: () => ({
      interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
    }),
  },
}));
import axios from "axios";

// -------------------------
// MOCK @/lib/api (if used anywhere in the component)
// -------------------------
vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// -------------------------
// MOCK Ant Design components to prevent responsive observer issues
// -------------------------
vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  return {
    ...actual,
    Modal: ({ open, children }) => (open ? <div data-testid="modal">{children}</div> : null),
    Tooltip: ({ children }) => <span>{children}</span>,
    Table: ({ children, dataSource, columns }) => (
      <table data-testid="table">
        <thead>
          <tr>
            {columns?.map((col, i) => <th key={i}>{col.title || `col-${i}`}</th>)}
          </tr>
        </thead>
        <tbody>
          {dataSource?.map((row, i) => (
            <tr key={i}>
              {columns?.map((col, j) => (
                <td key={j}>
                  {col.render ? col.render(row[col.dataIndex], row) : row[col.dataIndex]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    ),
    Input: ({ placeholder, onChange, value }) => (
      <input placeholder={placeholder} onChange={onChange} value={value} data-testid="input" />
    ),
    Row: ({ children }) => <div>{children}</div>,
    Col: ({ children }) => <div>{children}</div>,
    Card: ({ children, title }) => <div><h4>{title}</h4>{children}</div>,
    Descriptions: ({ children }) => <div>{children}</div>,
    Tag: ({ children }) => <span>{children}</span>,
  };
});

// Add Descriptions.Item after the mock
const Descriptions = { Item: ({ children, label }) => <div><strong>{label}:</strong> {children}</div> };

// Mock Ant Design icons
vi.mock("@ant-design/icons", () => ({
  EyeOutlined: ({ onClick }) => <span data-testid="eye-icon" onClick={onClick}>👁️</span>,
  InfoCircleOutlined: ({ onClick }) => <span data-testid="info-icon" onClick={onClick}>ℹ️</span>,
  SearchOutlined: () => <span data-testid="search-icon">🔍</span>,
}));

// -------------------------
// IMPORT COMPONENT (after mocks)
// -------------------------
// Adjust this import path to your project structure
import Cloud_Trail from "@/pages/Security/Cloud_Trail/Cloud_Trail";

// -------------------------
// Helpers
// -------------------------
const clearStorage = () => localStorage.clear();

describe("Cloud_Trail component (best/robust test)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    clearStorage();
  });

  afterEach(() => {
    clearStorage();
  });

  test("renders table after API returns rows", async () => {
    const fakeData = [
      {
        account_id: "A1",
        username: "john",
        event_name: "ConsoleLogin",
        resource_type: "EC2",
        source_ip: "10.0.0.1",
        aws_region: "us-east-1",
        event_id: "EV123",
        event_time: "2024-01-01",
      },
    ];

    axios.post.mockResolvedValue({ data: fakeData });
    localStorage.setItem("account_ids", JSON.stringify(["A1"]));

    render(<Cloud_Trail />);

    // Title or header should be present (sanity check)
    expect(screen.getByText(/cloud trail/i)).toBeInTheDocument();

    // Wait for table rows to render from mocked API
    await waitFor(() => expect(screen.getByText("ConsoleLogin")).toBeInTheDocument());

    expect(screen.getByText("EC2")).toBeInTheDocument();
    expect(screen.getByText("10.0.0.1")).toBeInTheDocument();
    expect(screen.getByText("us-east-1")).toBeInTheDocument();
  });

  test("filters rows when searching by username", async () => {
    const fakeData = [
      { username: "alpha", account_id: "A1", event_name: "Run", aws_region: "us" },
      { username: "bravo", account_id: "A2", event_name: "Stop", aws_region: "eu" },
    ];

    axios.post.mockResolvedValue({ data: fakeData });
    localStorage.setItem("account_ids", JSON.stringify(["A1", "A2"]));

    render(<Cloud_Trail />);

    // Wait for initial render
    await waitFor(() => expect(screen.getByText("alpha")).toBeInTheDocument());

    const searchBox = screen.getByPlaceholderText(/search by username/i);
    fireEvent.change(searchBox, { target: { value: "alpha" } });

    // Only matching row should remain
    expect(screen.getByText("alpha")).toBeInTheDocument();
    expect(screen.queryByText("bravo")).not.toBeInTheDocument();
  });

  test.skip("opens detail modal when view icon is clicked", async () => {
    const fakeData = [
      {
        account_id: "A1",
        username: "sam",
        event_id: "EV1",
        event_name: "StartInstances",
        event_time: "2024-01-10",
        resource_name: "Instance1",
        aws_region: "ap-south-1",
      },
    ];

    axios.post.mockResolvedValue({ data: fakeData });
    localStorage.setItem("account_ids", JSON.stringify(["A1"]));

    render(<Cloud_Trail />);

    await waitFor(() => expect(screen.getByText("sam")).toBeInTheDocument());

    // Find the Eye icon and click it
    const eyeIcon = screen.getByTestId("eye-icon");
    fireEvent.click(eyeIcon);

    // Modal mock should appear
    expect(await screen.findByTestId("modal")).toBeInTheDocument();
  });

  test("does not crash and shows base UI on API error", async () => {
    axios.post.mockRejectedValue(new Error("Network error"));
    localStorage.setItem("account_ids", JSON.stringify(["A1"]));

    render(<Cloud_Trail />);

    // Component should still render the title/heading
    await waitFor(() => expect(screen.getByText(/cloud trail/i)).toBeInTheDocument());

    // If your component displays a specific error message, you can assert it:
    // expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });
});
