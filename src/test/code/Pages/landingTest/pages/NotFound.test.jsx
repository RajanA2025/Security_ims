// NotFound.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import NotFound from "c:/project/jit_ms1/Security_ims/src/landing/pages/NotFound";

// Mock framer-motion so it renders plain elements in tests
vi.mock("framer-motion", () => {
  return {
    motion: {
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
  };
});

describe("NotFound component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders 404 heading and description", () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    // large 404 heading
    expect(screen.getByText("404")).toBeInTheDocument();

    // subheading and paragraph
    expect(screen.getByText(/Page Not Found/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Oops! The page you're looking for doesn't exist/i)
    ).toBeInTheDocument();
  });

  test("Go Home link points to root / and Go Back button calls history.back", () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    // "Go Home" link should exist and point to "/"
    const homeLink = screen.getByRole("link", { name: /Go Home/i });
    expect(homeLink).toBeInTheDocument();
    // MemoryRouter renders anchors with href like "/"
    expect(homeLink.getAttribute("href")).toBe("/");

    // Spy on history.back
    const backSpy = vi.spyOn(window.history, "back").mockImplementation(() => {});

    // "Go Back" button should call history.back()
    const backBtn = screen.getByRole("button", { name: /Go Back/i });
    expect(backBtn).toBeInTheDocument();
    fireEvent.click(backBtn);
    expect(backSpy).toHaveBeenCalled();

    backSpy.mockRestore();
  });

  test("popular links are present with expected hrefs", () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    );

    const solutions = screen.getByText("Solutions");
    const whyIMS = screen.getByText("Why IMS");
    const about = screen.getByText("About Us");
    const contact = screen.getByText("Contact");

    expect(solutions).toBeInTheDocument();
    expect(whyIMS).toBeInTheDocument();
    expect(about).toBeInTheDocument();
    expect(contact).toBeInTheDocument();

    // In MemoryRouter, Link renders anchors with matching hrefs
    expect(solutions.closest("a")).toHaveAttribute("href", "/solutions");
    expect(whyIMS.closest("a")).toHaveAttribute("href", "/why-IMS");
    expect(about.closest("a")).toHaveAttribute("href", "/about");
    expect(contact.closest("a")).toHaveAttribute("href", "/contact");
  });
});
