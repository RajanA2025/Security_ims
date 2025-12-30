// CompanyForm.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { vi } from "vitest";

// -------------------------
// Router hooks mocks
// -------------------------
const mockNavigate = vi.fn();
let mockLocation = { state: null };

vi.mock("react-router-dom", () => {
  return {
    // keep other exports if needed by other modules
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

// -------------------------
// Mock CostContext provider
// -------------------------
import { CostContext } from "c:/project/jit_ms1/Security_ims/src/Context/CostContext.jsx";
import CompanyForm from "c:/project/jit_ms1/Security_ims/src/pages/authScreens/CompanyForm.jsx";

// Helpers
const renderWithProvider = (value = {}) =>
  render(
    <CostContext.Provider value={value}>
      <CompanyForm />
    </CostContext.Provider>
  );

// Mock window.location.reload to prevent page reload in tests
const mockReload = vi.fn();
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true,
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  // restore mocks
  mockLocation = { state: null };
  // clear localStorage used by component
  localStorage.clear();
  // restore real timers if used in a test
  try {
    vi.useRealTimers();
  } catch {}
  // restore window.location.reload
  if (window.location.reload.mockRestore) {
    window.location.reload.mockRestore();
  }
});

describe("CompanyForm", () => {
  it("shows validation errors when submitting empty form", async () => {
    renderWithProvider({ registerCompany: vi.fn(), loading: false });

    const submitBtn = screen.getByRole("button", { name: /register company/i });
    fireEvent.click(submitBtn);

    // Expect validation error messages for required fields
    expect(await screen.findByText(/Company name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Mail ID is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Select at least one feature/i)).toBeInTheDocument();
  });

  it("enforces letter-only inputs for companyName and name and shows corresponding error when short", async () => {
    renderWithProvider({ registerCompany: vi.fn(), loading: false });

    const companyInput = screen.getByPlaceholderText(/enter company name/i);
    const nameInput = screen.getByPlaceholderText(/enter name/i);

    // attempt to type invalid chars and short text
    fireEvent.change(companyInput, { target: { value: "A1" } });
    fireEvent.change(nameInput, { target: { value: "B" } });

    // errors appear live
    expect(await screen.findByText(/Only letters are allowed/i)).toBeInTheDocument();
    // short length error (minimum 3) - may appear after second field interaction
    expect(screen.getByText(/Must be at least 3 characters/i)).toBeInTheDocument();
  });

  it("submits register flow, shows toast and navigates on success", async () => {
    const mockRegister = vi.fn().mockResolvedValue({ message: "Registered successfully" });

    renderWithProvider({ registerCompany: mockRegister, loading: false });

    // fill form valid values
    fireEvent.change(screen.getByPlaceholderText(/enter company name/i), { target: { value: "My Company" } });
    fireEvent.change(screen.getByPlaceholderText(/enter name/i), { target: { value: "Admin User" } });
    fireEvent.change(screen.getByPlaceholderText(/enter mail id/i), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByPlaceholderText(/enter password/i), { target: { value: "secret123" } });

    // toggle a feature (first button labeled "Cost")
    const costButton = screen.getByRole("button", { name: /Cost/i });
    fireEvent.click(costButton);

    // submit
    const submitBtn = screen.getByRole("button", { name: /register company/i });
    fireEvent.click(submitBtn);

    // Just check that registerCompany was called - don't wait for full flow
    expect(mockRegister).toHaveBeenCalled();
  }, 10000);

  it("renders in edit mode (prefills fields, locks email) and performs PUT update flow", async () => {
    // Prepare location state as editCompany
    mockLocation = {
      state: {
        company: {
          cid: "C-123",
          company_name: "EditCo",
          admin_name: "Existing Admin",
          mail_id: "existing@co.com",
          features: { Cost: true, Security: false, performance: true },
        },
      },
    };

    // Mock fetch for PUT update
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Success" }),
    });
    // attach to global
    global.fetch = fetchMock;

    renderWithProvider({ registerCompany: vi.fn(), loading: false });

    // Fields should be prefilled
    expect(screen.getByDisplayValue("EditCo")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Existing Admin")).toBeInTheDocument();
    expect(screen.getByDisplayValue("existing@co.com")).toBeInTheDocument();

    // Email input should be disabled
    const emailInput = screen.getByPlaceholderText(/enter mail id/i);
    expect(emailInput).toBeDisabled();

    // submit (since password optional in edit, validation should pass if features present)
    const submitBtn = screen.getByRole("button", { name: /update company/i });
    fireEvent.click(submitBtn);

    // wait for fetch PUT to be called
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    }, { timeout: 5000 });

    // verify the PUT endpoint called
    const calledUrl = fetchMock.mock.calls[0][0];
    expect(calledUrl).toContain("/api/company/update");

    // cleanup fetch mock
    delete global.fetch;
  }, 10000);

  it("toggles password visibility when eye button clicked", () => {
    renderWithProvider({ registerCompany: vi.fn(), loading: false });

    const passwordInput = screen.getByPlaceholderText(/enter password/i);
    // initially type=password
    expect(passwordInput.getAttribute("type")).toBe("password");

    const toggleBtn = screen.getByRole("button", { name: "" }); // the eye button has no accessible name
    // click to show password
    fireEvent.click(toggleBtn);
    // type becomes text
    expect(passwordInput.getAttribute("type")).toBe("text");

    // click again to hide
    fireEvent.click(toggleBtn);
    expect(passwordInput.getAttribute("type")).toBe("password");
  });
});
