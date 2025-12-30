// Sidebar.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";

// -----------------------------
// Mocks
// -----------------------------

// Mock react-router-dom BEFORE importing Sidebar
const navigateMock = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
  useLocation: () => ({ pathname: "/perfops" }), // ensure "Ops" layout selected
}));

// Mock @mui/material - provide minimal primitives used by Sidebar
vi.mock("@mui/material", async () => {
  const ReactActual = await vi.importActual("react");

  const Box = ({ children, ...rest }) => <div data-testid="mui-box" {...rest}>{children}</div>;
  const IconButton = ({ children, onClick, ...rest }) => (
    <button data-testid="mui-iconbutton" onClick={onClick} {...rest}>{children}</button>
  );
  const Tooltip = ({ children, title }) => <div data-testid="mui-tooltip" data-title={title}>{children}</div>;
  const Badge = ({ children }) => <span data-testid="mui-badge">{children}</span>;
  const useTheme = () => ({ breakpoints: { down: () => "md" } });
  // We'll allow tests to control mobile vs desktop by mocking useMediaQuery below
  const useMediaQuery = (fn) => false;

  return {
    Box,
    IconButton,
    Tooltip,
    Badge,
    useTheme,
    useMediaQuery,
  };
});

// Mock Typography from antd (Sidebar imports it)
vi.mock("antd", async () => {
  const actual = await vi.importActual("antd");
  return {
    ...actual,
    Typography: { Text: ({ children, ...rest }) => <span data-testid="antd-typography" {...rest}>{children}</span> },
  };
});

// Mock react-icons used in Sidebar (return simple spans with label)
vi.mock("react-icons/md", () => {
  const make = (name) => (props) => <span data-testid={`icon-${name}`}>{name}</span>;
  return {
    MdOutlineSecurity: make("MdOutlineSecurity"),
    MdDashboard: make("MdDashboard"),
    MdInsights: make("MdInsights"),
    MdCloudCircle: make("MdCloudCircle"),
    MdBusiness: make("MdBusiness"),
    MdAccessibility: make("MdAccessibility"),
    MdCloudySnowing: make("MdCloudySnowing"),
    MdMonitor: make("MdMonitor"),
    MdRampRight: make("MdRampRight"),
    MdMoney: make("MdMoney"),
    MdMoneyOff: make("MdMoneyOff"),
    MdSavings: make("MdSavings"),
    MdPublic: make("MdPublic"),
    MdAccountCircle: make("MdAccountCircle"),
  };
});

// Mock other icons used (GoTools, ManageAccountsIcon, IoIosArrowBack/Forward)
vi.mock("react-icons/go", () => ({ GoTools: (p) => <span data-testid="icon-GoTools">GoTools</span> }));
vi.mock("@mui/icons-material", () => ({ ExpandLess: (p) => <span>ExpandLess</span>, ExpandMore: (p) => <span>ExpandMore</span>, ManageAccountsIcon: (p) => <span>ManageAccountsIcon</span> }));
vi.mock("react-icons/io", () => ({ IoIosArrowBack: (p) => <span>IoBack</span>, IoIosArrowForward: (p) => <span>IoForward</span> }));

// -----------------------------
// Import component AFTER mocks
// -----------------------------
import Sidebar from "c:/project/jit_ms1/Security_ims/src/components/Sidebar.jsx";

describe("Sidebar component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // reset navigate mock
    navigateMock.mockClear();
  });

  test("renders expanded sidebar items (labels visible) when isExpanded=true", () => {
    render(<Sidebar isExpanded={true} setIsExpanded={() => {}} />);

    // In "perfops" layout first nav item label is 'Dashboard' (from navItemsOps)
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    // 'Business' should be present
    expect(screen.getByText("Business")).toBeInTheDocument();
  });

  test("renders collapsed sidebar (labels hidden) when isExpanded=false", () => {
    render(<Sidebar isExpanded={false} setIsExpanded={() => {}} />);

    // When collapsed, text labels shouldn't be visible
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("Business")).not.toBeInTheDocument();

    // Icons should still be present (we mocked MdDashboard)
    expect(screen.getAllByTestId(/^icon-/).length).toBeGreaterThan(0);
  });

  test("clicking a nav item navigates to its path", () => {
    render(<Sidebar isExpanded={true} setIsExpanded={() => {}} />);

    const dashboard = screen.getByText("Dashboard");
    fireEvent.click(dashboard);

    // For perfops layout, Dashboard path is "/perfops"
    expect(navigateMock).toHaveBeenCalledWith("/perfops");
  });

  test("submenu toggles open and clicking submenu item navigates", () => {
    // We'll render expanded so submenu labels appear
    render(<Sidebar isExpanded={true} setIsExpanded={() => {}} />);

    // 'Business' is a parent with subMenu
    const business = screen.getByText("Business");
    // open submenu by clicking parent
    fireEvent.click(business);

    // After clicking, Snapshot subitem should appear (label from navItemsOps)
    const snapshot = screen.getByText("Snapshot");
    expect(snapshot).toBeInTheDocument();

    // Click the subitem to navigate
    fireEvent.click(snapshot);
    expect(navigateMock).toHaveBeenCalledWith("/perfops/snapshot");
  });

  test("mobile behavior: clicking subItem closes sidebar (calls setIsExpanded(false))", async () => {
    // We need to simulate mobile environment. Re-mock useMediaQuery to return true.
    vi.doMock("@mui/material", async () => {
      const ReactActual = await vi.importActual("react");
      const Box = ({ children, ...rest }) => <div data-testid="mui-box" {...rest}>{children}</div>;
      const IconButton = ({ children, onClick, ...rest }) => (
        <button data-testid="mui-iconbutton" onClick={onClick} {...rest}>{children}</button>
      );
      const Tooltip = ({ children, title }) => <div data-testid="mui-tooltip" data-title={title}>{children}</div>;
      const Badge = ({ children }) => <span data-testid="mui-badge">{children}</span>;
      const useTheme = () => ({ breakpoints: { down: () => "md" } });
      const useMediaQuery = () => true; // mobile true
      return { Box, IconButton, Tooltip, Badge, useTheme, useMediaQuery };
    });

    // Need to re-import Sidebar with the new mock
    vi.resetModules();
    vi.doMock("@mui/material", async () => {
      const ReactActual = await vi.importActual("react");
      const Box = ({ children, ...rest }) => <div data-testid="mui-box" {...rest}>{children}</div>;
      const IconButton = ({ children, onClick, ...rest }) => (
        <button data-testid="mui-iconbutton" onClick={onClick} {...rest}>{children}</button>
      );
      const Tooltip = ({ children, title }) => <div data-testid="mui-tooltip" data-title={title}>{children}</div>;
      const Badge = ({ children }) => <span data-testid="mui-badge">{children}</span>;
      const useTheme = () => ({ breakpoints: { down: () => "md" } });
      const useMediaQuery = () => true; // mobile true
      return { Box, IconButton, Tooltip, Badge, useTheme, useMediaQuery };
    });

    // Import Sidebar after the new mock
    const { default: SidebarMobile } = await import("c:/project/jit_ms1/Security_ims/src/components/Sidebar.jsx");

    // create a setter spy to observe it being called
    const setIsExpandedSpy = vi.fn();
    render(<SidebarMobile isExpanded={true} setIsExpanded={setIsExpandedSpy} />);

    // open submenu
    const business = screen.getByText("Business");
    fireEvent.click(business);

    // click subitem
    const snapshot = screen.getByText("Snapshot");
    fireEvent.click(snapshot);

    // on mobile, clicking subItem should call navigate and also close sidebar via setIsExpanded(false)
    expect(navigateMock).toHaveBeenCalledWith("/perfops/snapshot");
    expect(setIsExpandedSpy).toHaveBeenCalledWith(false);

    // cleanup special mock
    vi.resetModules();
  });
});
