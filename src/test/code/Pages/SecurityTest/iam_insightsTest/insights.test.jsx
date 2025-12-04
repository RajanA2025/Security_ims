/**
 * Insights.test.jsx
 *
 * Vitest + React Testing Library tests for src/.../Insights.jsx
 *
 * Notes:
 * - We mock axios.post to return controlled data.
 * - Ant Design's Select/Modal/Table can behave a bit differently in test DOM;
 *   this suite focuses on content/behavior (API call, rendering, filtering).
 */

import React from "react";
import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import axios from "axios";

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

// mock axios with interceptors and create
vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
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

import Insights from "c:/project/jit_ms1/Security_ims/src/pages/Security/iam_insights/insights.jsx";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
});

const sampleData = [
  {
    user_name: "alice",
    account_id: "111",
    account_name: "Acct A",
    mfa_enabled: true,
    password_created_on: "2025-11-01T10:00:00Z",
    password_last_used: null,
    password_age: 15,
    access_key_1_age: 20,
    access_key_2_age: 120,
    has_admin_access: false,
    console_access: true,
    security_score: 78,
    risk_level: "LOW",
    inline_policies: [{ policy_name: "inline-A", allowed_services: ["s3"], denied_services: [] }],
    group_policies: [],
    managed_policies: []
  },
  {
    user_name: "bob",
    account_id: "222",
    account_name: "Acct B",
    mfa_enabled: false,
    password_created_on: null,
    password_last_used: null,
    password_age: null,
    access_key_1_age: null,
    access_key_2_age: null,
    has_admin_access: true,
    console_access: false,
    security_score: 42,
    risk_level: "HIGH",
    inline_policies: [],
    group_policies: [{ policy_name: "group-1", allowed_services: [], denied_services: ["ec2"] }],
    managed_policies: []
  }
];

describe("Insights component", () => {
  it("posts account_ids from localStorage and renders title + rows", async () => {
    // Arrange: put account ids in localStorage (component reads this)
    localStorage.setItem("account_ids", JSON.stringify(["111", "222"]));

    // Mock axios.post to resolve with sampleData
    axios.post.mockResolvedValueOnce({ data: sampleData });

    render(<Insights />);

    // Wait for axios.post to be called
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    // Verify axios.post called with the expected endpoint and body
    const [url, body] = axios.post.mock.calls[0];
    expect(url).toMatch(/\/iam\/filter/);
    expect(body).toEqual({ account_ids: ["111", "222"] });

    // Title should appear
    expect(screen.getByText(/IAM Insights/i)).toBeInTheDocument();

    // Wait for rows to render (users)
    await waitFor(() => {
      expect(screen.getByText("alice")).toBeInTheDocument();
      expect(screen.getByText("bob")).toBeInTheDocument();
    });

    // Verify one of the stat cards shows MFA Enabled
    expect(screen.getByText(/MFA Enabled/i)).toBeInTheDocument();
  });

  it("filters the table rows when typing in search input", async () => {
    localStorage.setItem("account_ids", JSON.stringify(["111", "222"]));
    axios.post.mockResolvedValueOnce({ data: sampleData });

    render(<Insights />);

    // Wait rows
    await waitFor(() => expect(screen.getByText("alice")).toBeInTheDocument());

    const searchInput = screen.getByPlaceholderText(/Search by Name/i);
    fireEvent.change(searchInput, { target: { value: "alice" } });

    // Now bob should be filtered out
    await waitFor(() => {
      expect(screen.getByText("alice")).toBeInTheDocument();
      expect(screen.queryByText("bob")).not.toBeInTheDocument();
    });
  });

  // Helper note:
  // Testing Ant Design modals, Select dropdowns, or clicking those tiny icons
  // (EyeOutlined / KeyOutlined) can be done, but requires more setup:
  // - For Select: open the dropdown using userEvent.click on the select trigger,
  //   then click the rendered option (Antd renders options in a portal).
  // - For Modal: click the icon that opens the modal (you can select it via container.querySelector)
  // If you want, I can extend this file to include modal open assertions (Access Key / Policy / More Details).
});
