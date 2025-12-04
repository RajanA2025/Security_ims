// Contact.test.jsx
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { vi } from "vitest";

// ----------------------
// Mocks (must be before importing component)
// ----------------------
vi.mock("framer-motion", () => {
  return {
    motion: {
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
      button: ({ children, ...props }) => <button {...props}>{children}</button>,
      p: ({ children, ...props }) => <p {...props}>{children}</p>,
    },
  };
});

// mock react-router-dom useNavigate (component imports it)
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Now import the component under test
import Contact from "c:/project/jit_ms1/Security_ims/src/landing/pages/Contact";

// Helper: flush microtasks
const flushPromises = () => new Promise((r) => setTimeout(r, 0));

describe("Contact component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // stub scrollTo so it doesn't throw
    window.scrollTo = vi.fn();
  });

  test("renders hero, contact info, FAQs and map placeholder", async () => {
    const { container } = render(<Contact />);

    // Hero title
    expect(screen.getByText(/Get in/i)).toBeInTheDocument();
    expect(screen.getByText(/Connect Now/i)).toBeInTheDocument();

    // Contact information items (phone and email)
    expect(screen.getByText("+91 78100 99942")).toBeInTheDocument();
    expect(screen.getByText("sales@jitglobalinfosystems.com")).toBeInTheDocument();

    // FAQs: check first question and total count
    expect(screen.getByText(/How long does it take to implement IMS\?/i)).toBeInTheDocument();
    const faqQuestions = container.querySelectorAll("h3");
    expect(faqQuestions.length).toBeGreaterThanOrEqual(4);

    // Map placeholder text
    expect(screen.getByText("Interactive Map Coming Soon")).toBeInTheDocument();
  });

  test("Connect Now scrolls to form and toggles highlight-form class", async () => {
    const { container } = render(<Contact />);

    // Ensure contact-form exists after render
    const contactForm = await screen.findByRole("region", { name: /Send us a Message/i }).catch(() => null);
    // If role not present, fallback to id lookup
    const formEl = document.getElementById("contact-form");
    expect(formEl).toBeTruthy();

    // Mock getBoundingClientRect to control position
    formEl.getBoundingClientRect = () => ({ top: 200, left: 0, width: 0, height: 0 });

    // Also ensure there's no header element so headerHeight fallback branch is used (80)
    const header = document.querySelector("header");
    if (header) header.remove();

    // Click Connect Now button
    const connectBtn = screen.getByRole("button", { name: /Connect Now/i });
    expect(connectBtn).toBeInTheDocument();

    // Use fake timers to manage the removal timeout
    vi.useFakeTimers();

    fireEvent.click(connectBtn);

    // scrollTo should be called with some top value
    expect(window.scrollTo).toHaveBeenCalled();
    
    // The form should have highlight-form class added
    expect(formEl.classList.contains("highlight-form")).toBe(true);

    // Advance timers by 2s to let class removal run
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // class should be removed
    expect(formEl.classList.contains("highlight-form")).toBe(false);

    vi.useRealTimers();
  });

  test("form submit shows success message", async () => {
    render(<Contact />);

    // Fill form fields
    const nameInput = screen.getByPlaceholderText("Your full name");
    const emailInput = screen.getByPlaceholderText("your@email.com");
    const messageInput = screen.getByPlaceholderText("Tell us about your requirements...");

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(messageInput, { target: { value: "Hello there" } });

    // Submit the form
    const sendBtn = screen.getByRole("button", { name: /Send Message/i });
    expect(sendBtn).toBeInTheDocument();

    fireEvent.click(sendBtn);

    // The success message should appear
    expect(await screen.findByText(/Message sent successfully!/i)).toBeInTheDocument();
  });

  test("contact links have correct href attributes", () => {
    render(<Contact />);

    const phoneLink = screen.getByText("+91 78100 99942").closest("a");
    expect(phoneLink).toHaveAttribute("href", "tel:+917810099942");

    const emailLink = screen.getByText("sales@jitglobalinfosystems.com").closest("a");
    expect(emailLink).toHaveAttribute("href", "mailto:sales@jitglobalinfosystems.com");
  });
});
