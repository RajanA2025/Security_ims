/**
 * src/test/code/Insights.test.jsx
 */
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi } from "vitest";

// ------------------------------------------------------
// 🔥 FULL MOCK OF axios + api.js (Option B) — required!
// ------------------------------------------------------
vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    create: () => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    })
  }
}));

// Mock the entire api.js so Dashboard never loads real axios instance
vi.mock("@/lib/api", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import axios from "axios";
import Insights from "@/pages/Dashboard";

// --------------------------------------------
// Helper
// --------------------------------------------
const resetLocalStorage = () => {
  localStorage.clear();
};

describe("Insights Component (Option B — Full Mock)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    resetLocalStorage();
  });

  // ------------------------------------------------------
  // 1️⃣ LOADING → RENDER CONTENT
  // ------------------------------------------------------
  test("renders IAM Insights & Security Groups after loading", async () => {
    const iamData = [
      { account_id: "100", mfa_enabled: true, password_created_on: "A", has_admin_access: false, console_access: true },
      { account_id: "200", mfa_enabled: false, password_created_on: null, has_admin_access: true, console_access: false },
    ];

    const sgData = [
      { from_port: 22, is_orphaned: false, ip_range: "0.0.0.0/0" },
      { from_port: 3389, is_orphaned: true, ip_range: "1.1.1.1/32" },
    ];

    axios.post.mockImplementation((url) => {
      if (url.includes("iam")) return Promise.resolve({ data: iamData });
      if (url.includes("security-groups")) return Promise.resolve({ data: sgData });
      return Promise.resolve({ data: [] });
    });

    localStorage.setItem("account_ids", JSON.stringify(["100", "200"]));

    render(<Insights />);

    expect(screen.getByText(/Loading security insights/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/IAM Insights/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/MFA Enabled/i)).toBeInTheDocument();
    expect(screen.getByText(/Security Groups/i)).toBeInTheDocument();
    expect(screen.getByText(/Open SSH/i)).toBeInTheDocument();
  });

  // ------------------------------------------------------
  // 2️⃣ ACCOUNT SYNC MODAL APPEARS
  // ------------------------------------------------------
  test("shows Account Sync modal when accounts mismatch", async () => {
    localStorage.setItem("account_ids", JSON.stringify(["ALL", "X1"]));

    axios.post.mockImplementation((url) => {
      if (url.includes("iam"))
        return Promise.resolve({
          data: [{ account_id: "999", mfa_enabled: true }]
        });

      return Promise.resolve({ data: [] });
    });

    render(<Insights />);

    await waitFor(() => {
      expect(screen.getByText(/Account Sync Pending/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /Okay, Got It/i }));

    expect(localStorage.getItem("timeModal")).toBeTruthy();
  });

  // ------------------------------------------------------
  // 3️⃣ ERROR SCENARIO
  // ------------------------------------------------------
  test("shows error alert when API fails", async () => {
    axios.post.mockRejectedValue(new Error("Network fail"));

    render(<Insights />);

    await waitFor(() =>
      expect(
        screen.getByText(/Failed to load data/i)
      ).toBeInTheDocument()
    );

    expect(screen.getByText(/Error/i)).toBeInTheDocument();
  });
});
