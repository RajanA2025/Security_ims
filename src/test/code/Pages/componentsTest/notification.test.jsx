// JITAdminNotifications.test.jsx
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { vi } from "vitest";

// The component under test (import after test setup)
import JITAdminNotifications from "c:/project/jit_ms1/Security_ims/src/components/notification.jsx";

describe("JITAdminNotifications", () => {
  let alertSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    // mock window.alert
    alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  test("renders the notification modal with initial requests", () => {
    render(<JITAdminNotifications />);

    // Header text
    expect(screen.getAllByText(/Company Requests/i)[0]).toBeInTheDocument();

    // Company names from mockRequests
    expect(screen.getByText("Alpha Corp")).toBeInTheDocument();
    expect(screen.getByText("Beta Ltd")).toBeInTheDocument();
    expect(screen.getByText("Gamma Inc")).toBeInTheDocument();

    // Some account badges should be present
    expect(screen.getByText("ACC001")).toBeInTheDocument();
    expect(screen.getByText("ACC101")).toBeInTheDocument();
  });

  test("accepting a request calls alert and removes that request card", async () => {
    render(<JITAdminNotifications />);

    // Find the Accept button for Alpha Corp (first company)
    const alphaAcceptButtons = screen.getAllByText("Accept");
    expect(alphaAcceptButtons.length).toBeGreaterThan(0);

    // Click the first Accept
    await act(async () => {
      fireEvent.click(alphaAcceptButtons[0]);
    });

    // Alert should have been called with the Accepted message for id 1
    expect(alertSpy).toHaveBeenCalledWith("Accepted request ID: 1");

    // Alpha Corp should no longer be in the document
    expect(screen.queryByText("Alpha Corp")).not.toBeInTheDocument();
  });

  test("rejecting a request calls alert and removes that request card", async () => {
    render(<JITAdminNotifications />);

    // Find Reject buttons and click the first one (Alpha Corp)
    const rejectButtons = screen.getAllByText("Reject");
    expect(rejectButtons.length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.click(rejectButtons[0]);
    });

    expect(alertSpy).toHaveBeenCalledWith("Rejected request ID: 1");

    // Alpha Corp removed
    expect(screen.queryByText("Alpha Corp")).not.toBeInTheDocument();
  });

  test("close button hides the modal", async () => {
    render(<JITAdminNotifications />);

    // Close button is the button with X icon - find it by looking for the first button (close button)
    const allButtons = screen.getAllByRole("button");
    const closeButton = allButtons[0]; // First button is the close button

    // click the close button - use the explicit close from the component
    await act(async () => {
      fireEvent.click(closeButton);
    });

    // The modal root text should not be present
    expect(screen.queryByText("Company Requests")).not.toBeInTheDocument();
  });

  test("processing all requests shows 'No pending requests'", async () => {
    render(<JITAdminNotifications />);

    // Keep clicking Accept on all currently visible Accept buttons until none remain
    // Use a loop to handle multiple cards
    while (true) {
      const acceptBtns = screen.queryAllByText("Accept");
      if (acceptBtns.length === 0) break;
      // click the first accept button
      // wrap with act to ensure state updates flush
      // eslint-disable-next-line no-await-in-loop
      await act(async () => {
        fireEvent.click(acceptBtns[0]);
      });
    }

    // After processing all, "No pending requests" should be visible
    expect(screen.getByText(/No pending requests/i)).toBeInTheDocument();
  });
});
