/**
 * @file Home.test.jsx
 */

import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Mocks ----

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: "/" }),
    Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
  };
});

// Mock Header component to avoid layout issues
vi.mock("../Components/Header", () => ({
  __esModule: true,
  default: () => <div data-testid="header">Header</div>,
}));

// Mock framer-motion: simple passthrough for elements we use
vi.mock("framer-motion", () => {
  const Wrapper = ({ children, ...rest }) => <div {...rest}>{children}</div>;
  const AnimatePresence = ({ children }) => <>{children}</>;
  return {
    motion: {
      h1: Wrapper,
      p: Wrapper,
      div: Wrapper,
      section: Wrapper,
      h2: Wrapper,
      button: Wrapper,
    },
    AnimatePresence,
  };
});

// Mock lucide-react icons as simple SVGs
vi.mock("lucide-react", () => {
  const Icon = (props) => <svg data-testid="icon" {...props} />;
  return {
    ArrowRight: Icon,
    Users: Icon,
    Building: Icon,
    BarChart3: Icon,
    Clock: Icon,
    Shield: Icon,
    Zap: Icon,
    Star: Icon,
    ChevronDown: Icon,
    Menu: Icon,
    X: Icon,
  };
});

// Component under test
import Home from "@/landing/pages/Home";

beforeEach(() => {
  mockNavigate.mockClear();
});

describe("Home page", () => {
  it("renders hero section with main title and subtitle", () => {
    render(<Home />);

    expect(
      screen.getByText(/Simplify/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Your complete solution for smarter, faster, and more efficient IT infrastructure management/i)
    ).toBeInTheDocument();
  });

  it("navigates to candidate register when hero Get Started is clicked", () => {
    render(<Home />);

    // Get the first Get Started button (hero section)
    const btn = screen.getAllByRole("button", { name: /Get Started/i })[0];
    fireEvent.click(btn);

    expect(mockNavigate).toHaveBeenCalledWith("/candidate-register");
  });

  it("navigates to About page when Learn More is clicked", () => {
    render(<Home />);

    const btn = screen.getByRole("button", { name: /Learn More/i });
    fireEvent.click(btn);

    expect(mockNavigate).toHaveBeenCalledWith("/about");
  });

  it("renders Why Choose IMS section and feature cards", () => {
    render(<Home />);

    // Section heading
    expect(
      screen.getByText(/Why Choose IMS\?/i)
    ).toBeInTheDocument();

    // Feature titles
    expect(
      screen.getByText(/Smart Asset Management/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Advanced Analytics/i)
    ).toBeInTheDocument();

    // Description snippets
    expect(
      screen.getByText(/Track, monitor, and optimize all your IT assets/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Real-time insights and performance metrics/i)
    ).toBeInTheDocument();
  });

  it("renders all testimonial cards", () => {
    render(<Home />);

    expect(
      screen.getByText(/What Our Users Say/i)
    ).toBeInTheDocument();

    // Names from testimonials array
    expect(screen.getByText(/Mr John/i)).toBeInTheDocument();
    expect(screen.getByText(/Mr Chen/i)).toBeInTheDocument();
    expect(screen.getByText(/Mr Michael/i)).toBeInTheDocument();

    // Some testimonial text
    expect(
      screen.getByText(/IMS made our hiring process so much faster and easier/i)
    ).toBeInTheDocument();
  });

  it("renders CTA section and navigates on CTA Get Started click", () => {
    render(<Home />);

    expect(
      screen.getByText(/Ready to Transform Your Aws\?/i)
    ).toBeInTheDocument();

    const ctaButton = screen.getAllByRole("button", { name: /Get Started/i })[1]; // second Get Started (CTA section)
    fireEvent.click(ctaButton);

    expect(mockNavigate).toHaveBeenCalledWith("/candidate-register");
  });

  it("covers remaining CTA button onClick handler", () => {
    render(<Home />);

    // Find the CTA section first
    const ctaSection = screen.getByText(/Ready to Transform Your Aws\?/i).closest('section');
    
    // Find the Get Started element within the CTA section (it's a div due to motion.button mock)
    const ctaButton = within(ctaSection).getByText("Get Started");
    
    // Click the CTA button (this should trigger line 231)
    fireEvent.click(ctaButton);
    
    expect(mockNavigate).toHaveBeenCalledWith("/candidate-register");
  });
});
