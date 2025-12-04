// Header.test.jsx
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { vi } from "vitest";

// ----------------------
// Mock react-router-dom hooks
// ----------------------
const navigateMock = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
  useLocation: () => ({ pathname: "/security" }),
}));

// ----------------------
// Mock AuthContext (useAuth)
// ----------------------
const logoutMock = vi.fn();
vi.mock("c:/project/jit_ms1/Security_ims/src/Context/AuthContext.jsx", () => ({
  useAuth: () => ({ logout: logoutMock }),
}));

// ----------------------
// Mock antd Typography used in Header
// ----------------------
vi.mock("antd", async () => {
  const React = await vi.importActual("react");
  const Typography = {
    Title: ({ children, style }) => <h4 data-testid="antd-title" style={style}>{children}</h4>,
    Text: ({ children, style }) => <span data-testid="antd-text" style={style}>{children}</span>,
  };
  return { Typography };
});

// ----------------------
// Mock @mui/icons-material icons used in Header
// ----------------------
vi.mock("@mui/icons-material", () => {
  const React = require("react");
  return {
    AccountCircleOutlined: (props) => <span data-testid="icon-account" {...props}>account</span>,
    Login: (props) => <span data-testid="icon-login" {...props}>login</span>,
    AccessTime: (props) => <span data-testid="icon-time" {...props}>time</span>,
    Menu: (props) => <span data-testid="icon-menu" {...props}>menu</span>,
  };
});

// ----------------------
// Mock @mui/material components used in Header
// We keep them simple wrappers that forward onClick/children/props so the component's state works.
// ----------------------
vi.mock("@mui/material", async () => {
  const React = await vi.importActual("react");

  const Simple = ({ children, "data-testid": dt, ...rest }) => (
    <div data-testid={dt} {...rest}>{children}</div>
  );

  const AppBar = ({ children, ...rest }) => <div data-testid="mui-appbar" {...rest}>{children}</div>;
  const Toolbar = ({ children, ...rest }) => <div data-testid="mui-toolbar" {...rest}>{children}</div>;
  const Box = ({ children, ...rest }) => <div data-testid="mui-box" {...rest}>{children}</div>;

  const IconButton = ({ children, onClick, ...rest }) => (
    <button data-testid="mui-iconbutton" onClick={onClick} {...rest}>
      {children}
    </button>
  );

  const MenuItem = ({ children, onClick, ...rest }) => (
    <div data-testid="mui-menuitem" onClick={onClick} role="menuitem" {...rest}>
      {children}
    </div>
  );

  // Our Menu renders children only when open === true
  const Menu = ({ children, open }) => {
    return <div data-testid="mui-menu" aria-hidden={!open}>{open ? children : null}</div>;
  };

  const Divider = (props) => <hr data-testid="mui-divider" {...props} />;
  const useTheme = () => ({
    breakpoints: {
      down: () => false, // default: not mobile
    },
  });
  const useMediaQuery = () => false; // default: not mobile

  const Tooltip = ({ children, title }) => (
    <div data-testid="mui-tooltip" title={title}>
      {children}
    </div>
  );

  return {
    AppBar,
    Toolbar,
    Box,
    IconButton,
    MenuItem,
    Menu,
    Divider,
    useTheme,
    useMediaQuery,
    Tooltip,
  };
});

// ----------------------
// Now import the component under test (after mocks)
// ----------------------
import Header from "c:/project/jit_ms1/Security_ims/src/components/Header.jsx";

describe("Header component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    navigateMock.mockClear();
    logoutMock.mockClear();
    // default admin token absent
    localStorage.removeItem("auth_token");
  });

  test("renders layout title based on pathname and shows last updated area", async () => {
    // Use default mocked useLocation of '/security' so layout expected "Security"
    render(<Header isExpanded={false} setIsExpanded={() => {}} />);

    // Title should be present
    expect(screen.getByTestId("antd-title")).toBeInTheDocument();
    expect(screen.getByTestId("antd-title").textContent).toBe("Security");

    // Last updated tooltip box (we mocked Tooltip wrapping an element)
    expect(screen.getByTestId("mui-tooltip")).toBeInTheDocument();
    // The last-updated text is rendered in antd.Text when not mobile - ensure it contains 'Last updated'
    const txtElements = screen.getAllByTestId("antd-text");
    // Find the element that contains 'Last updated'
    const lastUpdatedText = txtElements.find(el => el.textContent.includes('Last updated'));
    expect(lastUpdatedText).toBeInTheDocument();
    expect(lastUpdatedText.textContent).toMatch(/Last updated:/i);
  });

  test("opens profile menu when account button clicked and navigates to admin profile if admin token present", async () => {
    // set admin token
    localStorage.setItem("auth_token", "admin-auth");

    render(<Header isExpanded={false} setIsExpanded={() => {}} />);

    // Click the IconButton (there are two IconButtons in markup; query all and click the one for account)
    const iconButtons = screen.getAllByTestId("mui-iconbutton");
    expect(iconButtons.length).toBeGreaterThan(0);

    // Click the account IconButton (component renders only one interactive iconbutton in our simplified mock)
    fireEvent.click(iconButtons[iconButtons.length - 1]); // last one is account in our layout

    // Menu should now be open (our Menu reads open prop - component toggles anchorEl so open becomes true)
    const menu = screen.getByTestId("mui-menu");
    // Because open toggling is internal state, await a next tick
    // The mocked Menu renders children only when open true; check for a menuitem presence
    // There may be slight render scheduling; wrap in act
    await act(async () => {});

    // Find Profile menu item by its text presence inside menu
    const profileItem = screen.getByText(/Profile/i);
    expect(profileItem).toBeInTheDocument();

    // Click Profile menu item
    fireEvent.click(profileItem);

    // For admin token we expect navigation to admin profile
    expect(navigateMock).toHaveBeenCalledWith("/admin/profile");
  });

  test("logout menu item calls logout and navigates to /login", async () => {
    // set non-admin or admin token doesn't matter for logout path
    localStorage.setItem("auth_token", "some-token");

    render(<Header isExpanded={false} setIsExpanded={() => {}} />);

    const iconButtons = screen.getAllByTestId("mui-iconbutton");
    fireEvent.click(iconButtons[iconButtons.length - 1]);

    // Wait a tick
    await act(async () => {});

    // Find the Logout menu item (text "Logout")
    const logoutItem = screen.getByText(/Logout/i);
    expect(logoutItem).toBeInTheDocument();

    // Click logout
    fireEvent.click(logoutItem);

    // logout from context should be called
    expect(logoutMock).toHaveBeenCalled();

    // navigate to /login should be called
    expect(navigateMock).toHaveBeenCalledWith("/login");
  });
});
