// AuthContext.test.jsx
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { vi } from "vitest";

import { AuthProvider, useAuth } from "c:/project/jit_ms1/Security_ims/src/Context/AuthContext";

// Helper component for testing hook
function TestComponent() {
  const { isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      <p data-testid="auth">{isAuthenticated ? "yes" : "no"}</p>
      <button onClick={() => login("TOKEN123")}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  test("initial value isAuthenticated = false when no auth_token", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("auth").textContent).toBe("no");
  });

  test("initial value isAuthenticated = true when auth_token exists", () => {
    localStorage.setItem("auth_token", "ABC123");

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("auth").textContent).toBe("yes");
  });

  test("login() sets token and updates isAuthenticated", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("auth").textContent).toBe("no");

    fireEvent.click(screen.getByText("login"));

    expect(localStorage.getItem("auth_token")).toBe("TOKEN123");
    expect(screen.getByTestId("auth").textContent).toBe("yes");
  });

  test("logout() clears required keys and updates state", async () => {
    // set some values
    localStorage.setItem("auth_token", "XYZ");
    localStorage.setItem("company_cid", "123");
    localStorage.setItem("pillars", "abc");
    localStorage.setItem("account_ids", "[]");
    localStorage.setItem("timeModal", "1");
    localStorage.setItem("old_account_ids", "[]");

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText("logout"));

    expect(localStorage.getItem("auth_token")).toBeNull();
    expect(localStorage.getItem("company_cid")).toBeNull();
    expect(localStorage.getItem("pillars")).toBeNull();
    expect(localStorage.getItem("account_ids")).toBeNull();
    expect(localStorage.getItem("timeModal")).toBeNull();
    expect(localStorage.getItem("old_account_ids")).toBeNull();

    expect(screen.getByTestId("auth").textContent).toBe("no");
  });

  test("dispatching auth:logout event triggers logout behavior", () => {
    localStorage.setItem("auth_token", "AAA");
    localStorage.setItem("company_cid", "111");

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("auth").textContent).toBe("yes");

    act(() => {
      window.dispatchEvent(new Event("auth:logout"));
    });

    expect(localStorage.getItem("auth_token")).toBeNull();
    expect(screen.getByTestId("auth").textContent).toBe("no");
  });

  test("storage event syncs auth state across tabs", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially false
    expect(screen.getByTestId("auth").textContent).toBe("no");

    // Simulate another tab setting auth_token
    act(() => {
      localStorage.setItem("auth_token", "HELLO");
      window.dispatchEvent(new Event("storage"));
    });

    expect(screen.getByTestId("auth").textContent).toBe("yes");
  });

  test("useAuth throws when used outside provider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow(
      "useAuth must be used within AuthProvider"
    );

    consoleSpy.mockRestore();
  });
});
