/**
 * src/test/AccountsScreen.test.jsx
 */
import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { vi } from "vitest";
import "@testing-library/jest-dom";

// -------------------- mocks --------------------
// mock react-router navigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// mock CostContext to provide addAccount
const mockAddAccount = vi.fn();
vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useContext: () => ({ addAccount: mockAddAccount }),
  };
});

// lucide-react icons are harmless; mock minimal exports to avoid rendering issues
vi.mock("lucide-react", () => ({
  Plus: (p) => <span data-testid="icon-plus">Plus</span>,
  Minus: (p) => <span data-testid="icon-minus">Minus</span>,
  Eye: (p) => <span data-testid="icon-eye">Eye</span>,
  EyeOff: (p) => <span data-testid="icon-eyeoff">EyeOff</span>,
}));

// Because component uses many DOM features and no external network on mount (except fetch on submit),
// we don't need to mock antd — the component uses plain inputs and buttons.

// -------------------- imports (after mocks) --------------------
import AccountsScreen from "@/pages/authScreens/AccountsScreen"; // adjust path if needed

// -------------------- helpers --------------------
const fillInput = (placeholderText, value) => {
  const input = screen.getByPlaceholderText(new RegExp(placeholderText, "i"));
  fireEvent.change(input, { target: { value } });
  return input;
};

describe("AccountsScreen", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    // default pillars available to show dropdown options (so selecting pillars possible)
    localStorage.setItem("pillars", JSON.stringify({
      cost: true,
      security: true,
      performance: true,
      operational_excellence: true
    }));
    localStorage.setItem("company_cid", "123"); // so new accounts will get cid
  });

  test("renders initial account form and Add Account button", () => {
    render(<AccountsScreen />);

    // Title present
    expect(screen.getByText(/Account Registration/i)).toBeInTheDocument();

    // Add Account button should be visible (not in edit mode)
    expect(screen.getByRole("button", { name: /Add Account/i })).toBeInTheDocument();

    // There should be at least one Account ID label/input
    expect(screen.getByPlaceholderText(/Enter account id/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter account name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter access key/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter secret key/i)).toBeInTheDocument();
  });

  test("clicking Add Account appends another account card", () => {
    render(<AccountsScreen />);

    const addBtn = screen.getByRole("button", { name: /Add Account/i });
    fireEvent.click(addBtn);

    // Now there should be two "Account 1" and "Account 2" headings rendered
    // We can look for Account 2 heading
    expect(screen.getByText(/Account 2/i)).toBeInTheDocument();

    // Both account ID inputs should exist (two inputs labelled Account ID)
    const accountIdInputs = screen.getAllByPlaceholderText(/Enter account id/i);
    expect(accountIdInputs.length).toBeGreaterThanOrEqual(2);
  });

  test("submit without filling shows validation errors", async () => {
    render(<AccountsScreen />);

    const submitBtn = screen.getByRole("button", { name: /Submit/i });
    fireEvent.click(submitBtn);

    // Wait for validation errors to appear
    await waitFor(() => {
      expect(screen.getByText(/Account ID required/i)).toBeInTheDocument();
      expect(screen.getByText(/Account name required/i)).toBeInTheDocument();
      expect(screen.getByText(/Access key required/i)).toBeInTheDocument();
      expect(screen.getByText(/Secret key required/i)).toBeInTheDocument();
      expect(screen.getByText(/Select at least one pillar/i)).toBeInTheDocument();
    });

    // Toast error should also appear
    expect(screen.getByText(/Please fill all required fields/i) || screen.queryByText(/Please fill all required fields/i)).toBeTruthy();
  });

  test("successful submit posts each account and navigates", async () => {
    // Mock fetch to return ok each time
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );

    render(<AccountsScreen />);

    // Fill required fields for the first account
    // Account ID should only accept numbers; component filters non-digits
    const accIdInput = screen.getByPlaceholderText(/Enter account id/i);
    fireEvent.change(accIdInput, { target: { value: "  40001234abc " } }); // non-digits will be stripped by handler
    expect(accIdInput.value).toBe("40001234"); // after change handler, non-digits removed

    const accNameInput = screen.getByPlaceholderText(/Enter account name/i);
    fireEvent.change(accNameInput, { target: { value: "My Account" } });

    const accessKeyInput = screen.getByPlaceholderText(/Enter access key/i);
    fireEvent.change(accessKeyInput, { target: { value: "AKIA_TEST" } });

    const secretKeyInput = screen.getByPlaceholderText(/Enter secret key/i);
    fireEvent.change(secretKeyInput, { target: { value: "SECRET_123" } });

    // Because localStorage 'pillars' includes cost:true we should see pillar buttons.
    // Find and click the "Cost" pillar button inside the PillarDropdown.
    // PillarDropdown renders a button with text "Cost".
    const costBtn = screen.getByRole("button", { name: /Cost/i });
    fireEvent.click(costBtn);

    // When cost is selected, Bucket Name and Prefix fields are required and visible.
    const bucketInput = screen.getByPlaceholderText(/Enter bucket name/i);
    fireEvent.change(bucketInput, { target: { value: "my-bucket" } });

    const prefixInput = screen.getByPlaceholderText(/Enter prefix/i);
    fireEvent.change(prefixInput, { target: { value: "data/" } });

    // Submit
    const submitBtn = screen.getByRole("button", { name: /Submit/i });
    fireEvent.click(submitBtn);

    // Should call fetch once for the single account
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // After successful submission, navigate should be called to accounts manage route
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/imsproduct/accountsmanage");
    });

    // cleanup fetch mock
    global.fetch.mockRestore?.();
  });

  test("secret key visibility toggle works", () => {
    render(<AccountsScreen />);

    const secretInput = screen.getByPlaceholderText(/Enter secret key/i);
    // initial type should be password (component sets type="password" so <input type="password">)
    expect(secretInput).toHaveAttribute("type", "password");

    // Find the Eye/EyeOff button — it's a button in the InputField when type=password
    const toggleBtns = screen.getAllByRole("button");
    // Find a button in the same container as the secret input: navigate DOM
    const container = secretInput.closest("div"); // inner wrapper
    // the toggle button is sibling inside relative container; query for button inside that container
    const toggle = within(container).getByRole("button");
    fireEvent.click(toggle);

    // After clicking, input type becomes "text"
    expect(secretInput).toHaveAttribute("type", "text");

    // click again toggles back
    fireEvent.click(toggle);
    expect(secretInput).toHaveAttribute("type", "password");
  });
});
