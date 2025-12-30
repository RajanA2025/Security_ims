import "@testing-library/jest-dom";
import { vi } from "vitest";
import React from "react";

// Mock all image imports
vi.mock(".png", () => "mock-image.png");
vi.mock(".jpg", () => "mock-image.jpg");
vi.mock(".jpeg", () => "mock-image.jpeg");
vi.mock(".svg", () => "mock-image.svg");
vi.mock(".avif", () => "mock-image.avif");

// Mock MUI components
vi.mock("@mui/material", () => ({
  ...vi.importActual("@mui/material"),
  CircularProgress: () => <div>Loading...</div>,
  Typography: ({ children }) => <div>{children}</div>,
  Paper: ({ children }) => <div>{children}</div>,
  Box: ({ children }) => <div>{children}</div>,
  Grid: ({ children }) => <div>{children}</div>,
  Card: ({ children }) => <div>{children}</div>,
  CardContent: ({ children }) => <div>{children}</div>,
  CardHeader: ({ title }) => <div>{title}</div>,
  IconButton: ({ children }) => <button>{children}</button>,
  Tooltip: ({ children }) => <div>{children}</div>,
}));

// Mock MUI icons
vi.mock("@mui/icons-material", () => ({
  Settings: () => <div>Settings</div>,
  Security: () => <div>Security</div>,
  SecuritySharp: () => <div>SecuritySharp</div>,
  PortableWifiOffOutlined: () => <div>PortableWifiOffOutlined</div>,
  Warning: () => <div>Warning</div>,
  Error: () => <div>Error</div>,
  Info: () => <div>Info</div>,
  CheckCircle: () => <div>CheckCircle</div>,
  Cancel: () => <div>Cancel</div>,
  Refresh: () => <div>Refresh</div>,
  Close: () => <div>Close</div>,
  ExpandMore: () => <div>ExpandMore</div>,
  ExpandLess: () => <div>ExpandLess</div>,
  Menu: () => <div>Menu</div>,
  AccountCircle: () => <div>AccountCircle</div>,
  Lock: () => <div>Lock</div>,
  LockOpen: () => <div>LockOpen</div>,
  Visibility: () => <div>Visibility</div>,
  VisibilityOff: () => <div>VisibilityOff</div>,
}));

// Mock axios
vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      post: vi.fn(),
    })),
  },
}));

// Mock api.js
vi.mock("../../api", () => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

// Helper function to reset localStorage mocks
const resetLocalStorage = () => {
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
    removeItem: vi.fn(),
  };
  global.localStorage = localStorageMock;
};

export { resetLocalStorage };