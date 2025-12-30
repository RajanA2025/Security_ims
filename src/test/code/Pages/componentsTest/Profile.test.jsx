// Profile.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";

// -----------------------------
// Mocks
// -----------------------------
const navigateMock = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
  useLocation: () => ({ pathname: "/imsproduct/profile" }),
}));

// Mock useAuth
const logoutMock = vi.fn();
const defaultUser = {
  adminName: "Company Admin",
  email: "company@example.com",
  phone: "+91 9998887777",
  cid: "CID123",
  industry: "IT",
  created_at: "2024-02-01",
  location: "Chennai",
  lastLogin: "Yesterday",
  bio: "Company admin bio",
};
vi.mock("c:/project/jit_ms1/Security_ims/src/Context/AuthContext.jsx", () => ({
  useAuth: () => ({ logout: logoutMock, user: defaultUser }),
}));

// Mock @mui/icons-material (basic placeholders)
vi.mock("@mui/icons-material", () => ({
  Edit: (props) => <span data-testid="icon-edit">edit</span>,
  Logout: (props) => <span data-testid="icon-logout">logout</span>,
}));

// Mock @mui/material components to simple wrappers so DOM is predictable
vi.mock("@mui/material", async () => {
  const ReactActual = await vi.importActual("react");
  const Box = ({ children, ...rest }) => <div data-testid="mui-box" {...rest}>{children}</div>;
  const Card = ({ children, ...rest }) => <div data-testid="mui-card" {...rest}>{children}</div>;
  const CardContent = ({ children, ...rest }) => <div data-testid="mui-cardcontent" {...rest}>{children}</div>;
  const Avatar = ({ children, ...rest }) => <div data-testid="mui-avatar" {...rest}>{children}</div>;
  const Typography = ({ children, variant, ...rest }) => {
    const tag = variant === "h4" ? "h1" : variant === "h6" ? "h3" : "p";
    return ReactActual.createElement(tag, { "data-testid": `mui-typography-${variant || "p"}`, ...rest }, children);
  };
  const Divider = (props) => <hr data-testid="mui-divider" {...props} />;
  const Button = ({ children, onClick, ...rest }) => (
    <button data-testid="mui-button" onClick={onClick} {...rest}>{children}</button>
  );
  const Grid = ({ children, ...rest }) => <div data-testid="mui-grid" {...rest}>{children}</div>;
  return {
    Box,
    Card,
    CardContent,
    Avatar,
    Typography,
    Divider,
    Button,
    Grid,
  };
});

// -----------------------------
// Import component after mocks
// -----------------------------
import Profile from "c:/project/jit_ms1/Security_ims/src/components/Profile.jsx";

describe("Profile component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigateMock.mockClear();
    logoutMock.mockClear();
    localStorage.clear();
  });

  test("renders admin profile when auth_token === 'admin-auth'", () => {
    // Make token admin
    localStorage.setItem("auth_token", "admin-auth");

    // useAuth is mocked to return defaultUser; for admin scenario token dictates adminProfile usage
    render(<Profile />);

    // Admin profile title and role should appear
    expect(screen.getAllByText("System Administrator")[0]).toBeInTheDocument();
    expect(screen.getByText(/Admin —/i)).toBeInTheDocument();
    expect(screen.getAllByText("admin@jit.com")[0]).toBeInTheDocument();
    // Employee ID for admin
    expect(screen.getByText("ADMIN001")).toBeInTheDocument();
  });

  test("renders company profile using user from useAuth when no admin token", () => {
    // no auth token -> company profile
    localStorage.removeItem("auth_token");

    render(<Profile />);

    // Should show company admin name from mocked user
    expect(screen.getAllByText(defaultUser.adminName)[0]).toBeInTheDocument();
    // Email and phone from user
    expect(screen.getAllByText(defaultUser.email)[0]).toBeInTheDocument();
    expect(screen.getAllByText(defaultUser.phone)[0]).toBeInTheDocument();
    // Employee ID (cid)
    expect(screen.getAllByText(defaultUser.cid)[0]).toBeInTheDocument();
    // Department/industry
    expect(screen.getAllByText(defaultUser.industry)[0]).toBeInTheDocument();
    // Bio
    expect(screen.getByText(/Company admin bio/)).toBeInTheDocument();
  });

  test("clicking logout calls logout() and navigates to /login", () => {
    // Ensure company mode
    localStorage.removeItem("auth_token");
    render(<Profile />);

    // Find the Logout button (our mock renders Button as <button data-testid="mui-button">)
    // There are two buttons: Edit Profile and Logout. We'll find the one that contains text "Logout"
    const logoutBtn = screen.getAllByTestId("mui-button").find(btn => btn.textContent.includes("Logout"));
    expect(logoutBtn).toBeDefined();

    // Click it
    fireEvent.click(logoutBtn);

    // logout should be called
    expect(logoutMock).toHaveBeenCalled();

    // navigate to /login should be called
    expect(navigateMock).toHaveBeenCalledWith("/login");
  });
});
