// LoginScreen.test.jsx
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
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

// -------------------------
// Mock AuthContext
// -------------------------
vi.mock("c:/project/jit_ms1/Security_ims/src/Context/AuthContext.jsx", () => ({
  useAuth: () => ({
    login: vi.fn(),
  }),
}));

// -------------------------
// Mock CostContext provider
// -------------------------
import { CostContext } from "c:/project/jit_ms1/Security_ims/src/Context/CostContext.jsx";
import LoginScreen from "c:/project/jit_ms1/Security_ims/src/pages/authScreens/LoginScreen.jsx";

// Helpers
const renderWithProvider = (value = {}) =>
  render(
    <CostContext.Provider value={value}>
      <LoginScreen />
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

describe("LoginScreen", () => {
  it("renders login form correctly", () => {
    renderWithProvider({ loginCompany: vi.fn(), loading: false });

    // Check for main elements
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    renderWithProvider({ loginCompany: vi.fn(), loading: false });

    // Submit empty form
    const submitBtn = screen.getByRole("button", { name: /Login/i });
    fireEvent.click(submitBtn);

    // Should show some kind of validation (component may have built-in HTML5 validation)
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInvalid();
    expect(screen.getByPlaceholderText(/Enter password/i)).toBeInvalid();
  });

  it("toggles password visibility", () => {
    renderWithProvider({ loginCompany: vi.fn(), loading: false });

    const passwordInput = screen.getByPlaceholderText(/Enter password/i);
    const toggleBtn = screen.getByRole("button", { name: "Show password" });

    // Initially password should be hidden
    expect(passwordInput.getAttribute("type")).toBe("password");

    // Click to show password
    fireEvent.click(toggleBtn);
    expect(passwordInput.getAttribute("type")).toBe("text");

    // Click to hide password
    fireEvent.click(toggleBtn);
    expect(passwordInput.getAttribute("type")).toBe("password");
  });

  it("handles hardcoded admin login successfully", async () => {
    const mockLogin = vi.fn();
    renderWithProvider({ loginCompany: vi.fn(), loading: false });

    // Fill in admin credentials
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "admin@Jit.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter password/i), {
      target: { value: "Test@1234" },
    });

    // Submit form
    const submitBtn = screen.getByRole("button", { name: /Login/i });
    fireEvent.click(submitBtn);

    // Should show success toast
    await waitFor(() => {
      expect(screen.getByText(/Welcome Admin/i)).toBeInTheDocument();
    });
  });

  it("handles company login with API call", async () => {
    const mockLoginCompany = vi.fn().mockResolvedValue({
      message: "Login successful",
      cid: "company-123",
      token: "auth-token",
    });

    renderWithProvider({ loginCompany: mockLoginCompany, loading: false });

    // Fill in company credentials
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "company@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter password/i), {
      target: { value: "password123" },
    });

    // Submit form
    const submitBtn = screen.getByRole("button", { name: /Login/i });
    fireEvent.click(submitBtn);

    // Should call loginCompany API
    await waitFor(() => {
      expect(mockLoginCompany).toHaveBeenCalledWith({
        email: "company@test.com",
        password: "password123",
      });
    });
  });

  it("shows error message for invalid credentials", async () => {
    const mockLoginCompany = vi.fn().mockResolvedValue({
      message: "Login failed!",
    });

    renderWithProvider({ loginCompany: mockLoginCompany, loading: false });

    // Fill in invalid credentials
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "invalid@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter password/i), {
      target: { value: "wrongpassword" },
    });

    // Submit form
    const submitBtn = screen.getByRole("button", { name: /Login/i });
    fireEvent.click(submitBtn);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Login failed!/i)).toBeInTheDocument();
    });
  });
});
