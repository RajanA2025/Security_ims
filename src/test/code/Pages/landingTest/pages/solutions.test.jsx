// Solutions.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import Solutions from "c:/project/jit_ms1/Security_ims/src/landing/pages/solutions";

// ----------------------
// Mock framer-motion
// ----------------------
vi.mock("framer-motion", () => {
  return {
    motion: {
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
      button: ({ children, ...props }) => <button {...props}>{children}</button>,
    },
  };
});

// ----------------------
// Mock react-router useNavigate
// ----------------------
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Solutions component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders hero title, description and primary Get Started button", () => {
    render(<Solutions />);

    // Hero title contains 'Solutions for Every'
    expect(screen.getByText(/Solutions for Every/i)).toBeInTheDocument();

    // Description present
    expect(
      screen.getByText(/IMS provides tailored solutions for HR teams, management, and candidates/i)
    ).toBeInTheDocument();

    // Primary Get Started button exists
    const getStarted = screen.getAllByRole("button", { name: /Get Started/i })[0];
    expect(getStarted).toBeInTheDocument();
  });

  test("clicking hero Get Started calls navigate('/candidate-register')", () => {
    render(<Solutions />);

    const getStarted = screen.getAllByRole("button", { name: /Get Started/i })[0];
    fireEvent.click(getStarted);

    expect(mockNavigate).toHaveBeenCalledWith("/candidate-register");
  });

  test("renders all solution cards with titles and features", () => {
    render(<Solutions />);

    // There are 3 solution cards based on the component
    expect(screen.getByText("For HR Teams")).toBeInTheDocument();
    expect(screen.getByText("For Management")).toBeInTheDocument();
    expect(screen.getByText("For Candidates")).toBeInTheDocument();

    // Verify a couple of features are present inside the cards
    expect(screen.getByText(/Centralized Job Posting & Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Real-time Hiring Dashboards/i)).toBeInTheDocument();
    expect(screen.getByText(/Simple Application Process/i)).toBeInTheDocument();
  });

  test("process flow items render (5 items) and CTA at bottom navigates", () => {
    render(<Solutions />);

    // There are 5 process items (Job Posting, Candidate Sourcing, Interview Management, Decision Making, Onboarding)
    // Use getAllByText for items that appear in multiple places
    expect(screen.getAllByText(/Job Posting/i)).toHaveLength(3);
    expect(screen.getByText(/Candidate Sourcing/i)).toBeInTheDocument();
    expect(screen.getByText(/Interview Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Decision Making/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Onboarding/i)).toHaveLength(3);

    // Bottom CTA button also navigates
    const ctaButtons = screen.getAllByRole("button", { name: /Get Started/i });
    // bottom CTA typically second button
    expect(ctaButtons.length).toBeGreaterThanOrEqual(1);
    const bottomCta = ctaButtons[cTaIndexOrFallback(ctaButtons)];
    fireEvent.click(bottomCta);

    expect(mockNavigate).toHaveBeenCalledWith("/candidate-register");
  });
});

// Helper: choose last button index (bottom CTA) if multiple exist
function cTaIndexOrFallback(buttons) {
  if (!buttons || buttons.length === 0) return 0;
  return buttons.length - 1;
}
