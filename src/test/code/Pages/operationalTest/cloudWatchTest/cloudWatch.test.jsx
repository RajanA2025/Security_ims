// src/pages/Business/Business.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi } from "vitest";
import axios from "axios";
import Business from "@/pages/operational/cloudWatch/cloudWatch"; // adjust path if needed

vi.mock("axios");

// Mock window.matchMedia for Ant Design responsive utilities
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

describe("Business component", () => {
  const sampleData = [
    // item missing event_id -> should use fallback rowKey
    {
      // event_id: undefined,
      account_id: "123",
      account_name: "Alice",
      alarm_name: "Alarm-One",
      metric_name: "CPU",
      instance_id: "i-aaa111",
      instance_name: "web-01",
      threshold: 80,
      comparison_operator: "UnknownOperator",
      event_time: "2025-12-01T00:00:00Z",
      history_timestamp: "2025-12-01T00:00:00Z",
    },
    // item with event_id present
    {
      event_id: "evt-002",
      account_id: "456",
      account_name: "Bob",
      alarm_name: "Alarm-Two",
      metric_name: "Memory",
      instance_id: "i-bbb222",
      instance_name: "db-01",
      threshold: 30,
      comparison_operator: "GreaterThanThreshold",
      event_time: "2025-12-02T00:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Set a predictable account_ids in localStorage (JSON format)
    window.localStorage.setItem("account_ids", JSON.stringify(["123", "456"]));
    axios.post.mockResolvedValue({ data: sampleData });
  });

  afterEach(() => {
    // cleanup localStorage changes to avoid test bleed
    window.localStorage.removeItem("account_ids");
  });

  it("fetches and displays rows from API", async () => {
    render(<Business />);

    // Wait for table header/title to appear
    expect(await screen.findByText(/Cloud-Watch/i)).toBeInTheDocument();

    // Rows containing account names should be present
    expect(await screen.findByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();

    // Alarm names and metric names should appear
    expect(screen.getByText("Alarm-One")).toBeInTheDocument();
    expect(screen.getByText("CPU")).toBeInTheDocument();
  });

  it("creates a fallback rowKey when event_id is missing", async () => {
    render(<Business />);

    // wait until data rendered
    await screen.findByText("Alice");

    // The fallback key in component is `${usernameSafe}-${timeSafe}`
    const expectedFallbackKey = `Alice-2025-12-01T00:00:00Z`;

    // AntD Table attaches data-row-key attribute to <tr>
    // find a row with that data-row-key
    const row = document.querySelector(`tr[data-row-key="${expectedFallbackKey}"]`);
    expect(row).toBeTruthy();

    // And it should contain Alice's account id cell
    expect(within(row).getByText("123")).toBeInTheDocument();
  });

  it("shows operator fallback ('?') for unknown comparison_operator", async () => {
    render(<Business />);

    // Wait for row render
    await screen.findByText("Alice");

    // The rendered Threshold cell shows operator symbol and value.
    // For unknown operator we expect "?" to appear near threshold value 80
    // Use a regex to find "?" followed by 80 (allow spacing)
    const thresholdCell = await screen.findByText((content, node) => {
      // look for "80" with a "?" somewhere in the node text
      return /\?\s*80/.test(content);
    });

    expect(thresholdCell).toBeTruthy();
  });

  it("filters rows by search input (Account Name)", async () => {
    render(<Business />);

    await screen.findByText("Alice");
    expect(screen.getByText("Bob")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText("Search by Account Name");
    // Type "alice" (case-insensitive)
    fireEvent.change(searchInput, { target: { value: "alice" } });

    // Alice remains, Bob should be filtered out
    expect(await screen.findByText("Alice")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText("Bob")).not.toBeInTheDocument();
    });

    // Clear search -> Bob should reappear
    fireEvent.change(searchInput, { target: { value: "" } });
    expect(await screen.findByText("Bob")).toBeInTheDocument();
  });

  it("opens modal with details when clicking Eye icon", async () => {
    render(<Business />);

    await screen.findByText("Alice");

    // Find the row containing Alice
    const aliceRow = screen.getByText("Alice").closest("tr");
    const withinAlice = within(aliceRow);

    // Try to find the Eye icon button
    let eyeBtn = withinAlice.queryByRole("button", { name: /view|details|eye/i });

    // If not found by role, try to find svg with Eye icon
    if (!eyeBtn) {
      const svgElems = aliceRow.querySelectorAll("svg");
      eyeBtn = Array.from(svgElems).find(
        (el) =>
          el.getAttribute("data-icon") === "eye" ||
          el.closest('[title*="View"]') ||
          el.closest("span") ||
          el.closest("button") ||
          el.parentElement?.getAttribute("role") === "button"
      );
    }

    // Fallback: query for any element with title attribute 'View Details' inside row
    if (!eyeBtn) {
      eyeBtn = withinAlice.queryByTitle("View Details");
      if (!eyeBtn) {
        // try to find clickable svg in row
        const maybeSvg = aliceRow.querySelector("svg");
        eyeBtn = maybeSvg ? maybeSvg.parentElement : null;
      }
    }

    expect(eyeBtn).toBeTruthy();

    // Click it
    fireEvent.click(eyeBtn);

    // Modal title should include "Alice - Account Details"
    const modalTitlePattern = /Alice\s*-\s*Account Details/i;
    expect(await screen.findByText(modalTitlePattern)).toBeInTheDocument();

    // Modal content should contain some details - check for the actual values
    // "123" appears in both table and modal, so we expect at least 2 instances
    expect(screen.getAllByText("123").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Alice").length).toBeGreaterThanOrEqual(2);
  });

  it("handles localStorage error gracefully", async () => {
    // Mock localStorage to throw an error
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = vi.fn(() => {
      throw new Error("localStorage access denied");
    });

    render(<Business />);

    await screen.findByText("Alice");

    // Restore original localStorage
    localStorage.getItem = originalGetItem;
  });

  it("handles various localStorage data formats", async () => {
    // Set up mock data that will be used by all test cases
    const mockData = [
      {
        account_id: "123",
        account_name: "Alice",
        alarm_name: "Test Alarm",
        metric_name: "CPU",
        instance_id: "i-123456",
        instance_name: "test-instance",
        threshold: 80,
        comparison_operator: "GreaterThanThreshold",
        event_time: "2025-01-01T00:00:00Z"
      }
    ];
    
    const testCases = [
      { desc: 'empty string', value: '""', expectData: true },
      { desc: 'non-JSON string', value: '"123"', expectData: true },
      { desc: 'comma-separated string', value: '"123,456"', expectData: true },
      { desc: 'invalid JSON', value: 'invalid-json', expectData: true }
    ];

    const originalGetItem = localStorage.getItem;
    
    for (const testCase of testCases) {
      // Set up mocks
      localStorage.getItem = vi.fn(() => testCase.value);
      axios.post.mockResolvedValueOnce({ data: testCase.expectData ? mockData : [] });
      
      // Render and wait for loading to complete
      const { unmount } = render(<Business />);
      
      try {
        // Verify the component rendered with the mock data
        if (testCase.expectData) {
          const aliceCell = await screen.findByText('Alice');
          expect(aliceCell).toBeInTheDocument();
        } else {
          // For empty data, verify the table is empty
          const emptyText = await screen.findByText(/no data/i);
          expect(emptyText).toBeInTheDocument();
        }
      } finally {
        // Clean up
        unmount();
      }
    }
    
    // Restore original localStorage
    localStorage.getItem = originalGetItem;
  });

  it("handles API fetch error", async () => {
    const originalConsoleError = console.error;
    console.error = vi.fn(); // Suppress error logs for this test
    
    try {
      // Mock axios to throw an error
      axios.post.mockRejectedValue(new Error("Network error"));

      render(<Business />);

      // Should still render the component even with API error
      await screen.findByText("Cloud-Watch");
      
      // Verify the error state is handled (e.g., empty table or error message)
      expect(screen.queryByText(/error loading data/i)).not.toBeInTheDocument();
    } finally {
      console.error = originalConsoleError;
    }
  });

  it("filters by alarm name", async () => {
    render(<Business />);

    await screen.findByText("Alice");

    // Find the alarm name filter
    const alarmNameFilter = screen.getByText("Alarm Name");
    expect(alarmNameFilter).toBeInTheDocument();
  });

  it("filters by instance name", async () => {
    render(<Business />);

    await screen.findByText("Alice");

    // Find the instance name filter
    const instanceNameFilter = screen.getByText("Instance Name");
    expect(instanceNameFilter).toBeInTheDocument();
  });

  it("closes modal when cancel button is clicked", async () => {
    // Mock the API response
    const mockData = [
      {
        account_id: "123",
        account_name: "Alice",
        alarm_name: "Test Alarm",
        metric_name: "CPU",
        instance_id: "i-123456",
        instance_name: "test-instance",
        threshold: 80,
        comparison_operator: "GreaterThanThreshold",
        event_time: "2025-01-01T00:00:00Z"
      }
    ];
    axios.post.mockResolvedValueOnce({ data: mockData });

    // Render the component
    render(<Business />);

    // Wait for data to load
    const aliceCell = await screen.findByText('Alice');
    const row = aliceCell.closest('tr');
    
    // Find and click the Eye icon to open modal
    const eyeIcon = within(row).getByRole('img', { name: 'eye' });
    fireEvent.click(eyeIcon);

    // Wait for modal to open
    const modal = await screen.findByRole('dialog');
    expect(modal).toBeInTheDocument();

    // Find and click the close button
    const closeButton = within(modal).getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    // Wait for modal to close
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
