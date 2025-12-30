// Preloader.test.jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import Preloader from "c:/project/jit_ms1/Security_ims/src/landing/Components/Preloader";

// Mock framer-motion so animations don’t break the test
vi.mock("framer-motion", () => {
  return {
    motion: {
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
      p: ({ children, ...props }) => <p {...props}>{children}</p>,
    },
    AnimatePresence: ({ children }) => <div>{children}</div>,
  };
});

describe("Preloader Component", () => {
  
  test("renders when isVisible = true", () => {
    render(<Preloader isVisible={true} />);

    // Check brand title
    expect(screen.getByText("IMS")).toBeInTheDocument();

    // Check loading text
    expect(screen.getByText("Loading, please wait...")).toBeInTheDocument();

    // Progress bar container (glass card)
    expect(screen.getByText("by JIT Global Info Systems")).toBeInTheDocument();
  });

  test("does NOT render when isVisible = false", () => {
    render(<Preloader isVisible={false} />);

    // “IMS” shouldn’t exist when hidden
    expect(screen.queryByText("IMS")).not.toBeInTheDocument();
  });

  test("spinner container exists when visible", () => {
    const { container } = render(<Preloader isVisible={true} />);

    // Spinner div with border class
    const spinner = container.querySelector("div.w-16.h-16");
    expect(spinner).toBeTruthy();
  });
});
