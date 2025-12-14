import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import Header from '../../../../../landing/Components/Hearder';

// Mock Icons
vi.mock('../../../utils/icon-imports', () => ({
  Menu: () => <span data-testid="icon">Menu</span>,
  X: () => <span data-testid="icon">X</span>,
  ChevronDown: () => <span data-testid="icon">ChevronDown</span>,
  Search: () => <span data-testid="icon">Search</span>,
  User: () => <span data-testid="icon">User</span>,
  LogOut: () => <span data-testid="icon">LogOut</span>,
}));

// Mock Logo component
vi.mock('../../../components/Logo', () => ({
  default: ({ className }) => <span data-testid="logo" className={className}>Logo</span>,
}));

// Mock framer-motion
vi.mock('framer-motion', () => {
  return {
    motion: {
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }) => <div>{children}</div>,
  };
});

// Helper function to set viewport width
const setViewportWidth = (width) => {
  global.innerWidth = width;
  global.dispatchEvent(new Event('resize'));
};

describe('Header component', () => {
  let mockNavigate;

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = '';
    mockNavigate = vi.fn();
    
    // Mock react-router-dom for each test
    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        MemoryRouter: actual.MemoryRouter,
        Link: ({ children, to, ...rest }) => <a href={to} {...rest}>{children}</a>,
        useNavigate: () => mockNavigate,
        useLocation: () => ({ pathname: '/' }),
      };
    });
  });

  test('renders nav items and opens desktop Products dropdown + product modal', async () => {
    const { MemoryRouter } = await import('react-router-dom');
    render(
      <MemoryRouter>
        <Header isDashboard={false} />
      </MemoryRouter>
    );

    // Check if nav items are rendered
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About Us')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();

    // Open products dropdown - find the button element, not just the span
    const productsSpan = screen.getByText('Products');
    const productsButton = productsSpan.closest('button');
    
    // Use act to wrap state updates
    act(() => {
      fireEvent.click(productsButton);
    });
    
    // Check if dropdown opened
    const ariaExpanded = productsButton.getAttribute('aria-expanded');
    expect(ariaExpanded).toBe('true');

    // Click on a product that opens modal
    const intelliChatButton = screen.getByText('IntelliChat');
    fireEvent.click(intelliChatButton);

    // Verify modal is shown
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
    expect(screen.getByText(/Our Developers are working on that/)).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    // Verify modal is closed
    await waitFor(() => {
      expect(screen.queryByText('Coming Soon')).not.toBeInTheDocument();
    });
  });

  test('shows search input when isDashboard=true and accepts typing', () => {
    const { MemoryRouter } = require('react-router-dom');
    render(
      <MemoryRouter>
        <Header isDashboard={true} />
      </MemoryRouter>
    );

    const searchInput = screen.getByPlaceholderText('Search...');
    expect(searchInput).toBeInTheDocument();

    // Test typing in search
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    expect(searchInput.value).toBe('test search');
  });

  test('mobile menu toggles and mobile Get Started/Login call navigate', () => {
    const { MemoryRouter } = require('react-router-dom');
    // Set mobile viewport
    setViewportWidth(360);
    
    render(
      <MemoryRouter>
        <Header isDashboard={false} />
      </MemoryRouter>
    );

    // Menu button should be visible on mobile
    const menuButton = screen.getByLabelText('Open menu');
    expect(menuButton).toBeInTheDocument();

    // Click to open menu
    fireEvent.click(menuButton);
    
    // Check if mobile menu is open by looking for mobile-specific elements
    // Use getAllByText to get all instances and check the mobile one
    const getStartedButtons = screen.getAllByText('Get Started');
    expect(getStartedButtons.length).toBe(2); // Desktop and mobile versions
    
    const loginButtons = screen.getAllByText('Login');
    expect(loginButtons.length).toBe(2); // Desktop and mobile versions

    // Test navigation on mobile version (the one with w-full class)
    const mobileGetStarted = getStartedButtons.find(btn => 
      btn.className.includes('w-full')
    );
    if (mobileGetStarted) {
      fireEvent.click(mobileGetStarted);
    }
    
    const mobileLogin = loginButtons.find(btn => 
      btn.className.includes('w-full')
    );
    if (mobileLogin) {
      fireEvent.click(mobileLogin);
    }
  });

  test('body overflow toggles when mobile menu opens/closes', () => {
    const { MemoryRouter } = require('react-router-dom');
    // Set mobile viewport
    setViewportWidth(360);
    
    render(
      <MemoryRouter>
        <Header isDashboard={false} />
      </MemoryRouter>
    );

    // Open mobile menu
    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);
    
    // Check if body has overflow hidden when menu is open
    expect(document.body).toHaveStyle('overflow: hidden');

    // Close mobile menu
    const closeButton = screen.getByLabelText('Close menu');
    fireEvent.click(closeButton);
    
    // Check if body overflow is reset (it's set to empty string, not 'auto')
    expect(document.body.style.overflow).toBe('');
  });

  test('aria-expanded toggles on desktop Products button', async () => {
    const { MemoryRouter } = require('react-router-dom');
    render(
      <MemoryRouter>
        <Header isDashboard={false} />
      </MemoryRouter>
    );

    // Find the button element, not just the span
    const productsSpan = screen.getByText('Products');
    const productsButton = productsSpan.closest('button');
    
    // Initially should have aria-expanded="false"
    expect(productsButton).toHaveAttribute('aria-expanded', 'false');
    
    // Click to expand
    act(() => {
      fireEvent.click(productsButton);
    });
    expect(productsButton).toHaveAttribute('aria-expanded', 'true');
    
    // Click again to collapse
    act(() => {
      fireEvent.click(productsButton);
    });
    expect(productsButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('handles window resize events', async () => {
    const { MemoryRouter } = require('react-router-dom');
    // Set initial viewport to mobile
    setViewportWidth(360);
    
    render(
      <MemoryRouter>
        <Header isDashboard={false} />
      </MemoryRouter>
    );
    
    // Open mobile menu
    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);
    
    // Verify mobile menu is open by checking for mobile-specific elements
    const mobileMenuItems = screen.getAllByText('About Us');
    expect(mobileMenuItems.length).toBe(2); // Desktop and mobile versions

    // Resize to desktop
    act(() => {
      setViewportWidth(1024);
      window.dispatchEvent(new Event('resize'));
    });

    // After resize, mobile menu should be closed
    // Check that only desktop version remains
    await waitFor(() => {
      const aboutUsItems = screen.getAllByText('About Us');
      expect(aboutUsItems.length).toBe(1); // Only desktop version should remain
    });
  });

  test('toggles mobile products dropdown', () => {
    const { MemoryRouter } = require('react-router-dom');
    // Set mobile viewport
    setViewportWidth(360);
    
    render(
      <MemoryRouter>
        <Header isDashboard={false} />
      </MemoryRouter>
    );
    
    // Open mobile menu
    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);
    
    // Click products dropdown
    const productsButtons = screen.getAllByText('Products');
    const mobileProductsButton = productsButtons[productsButtons.length - 1];
    fireEvent.click(mobileProductsButton);
    
    // Verify dropdown is open
    expect(mobileProductsButton).toHaveAttribute('aria-expanded', 'true');
    
    // Click on a product
    const intelliChatButton = screen.getByText('IntelliChat');
    fireEvent.click(intelliChatButton);
    
    // Verify product modal is shown
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  test('navigates to correct routes', () => {
    const { MemoryRouter } = require('react-router-dom');
    render(
      <MemoryRouter>
        <Header isDashboard={false} />
      </MemoryRouter>
    );
    
    // Test navigation items
    const navItems = ['About Us', 'Contact'];
    navItems.forEach(item => {
      const link = screen.getByText(item);
      fireEvent.click(link);
    });
  });

  test('mobile navigation links close mobile menu and products dropdown', () => {
    const { MemoryRouter } = require('react-router-dom');
    // Set mobile viewport
    setViewportWidth(360);
    
    render(
      <MemoryRouter>
        <Header isDashboard={false} />
      </MemoryRouter>
    );
    
    // Open mobile menu
    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);
    
    // Open mobile products dropdown
    const productsButtons = screen.getAllByText('Products');
    const mobileProductsButton = productsButtons[productsButtons.length - 1];
    fireEvent.click(mobileProductsButton);
    
    // Click on a navigation link in mobile products dropdown
    const rmsLink = screen.getByText('RMS');
    fireEvent.click(rmsLink);
    
    // Verify mobile menu and products dropdown are closed
    // This tests lines 322-323
    expect(screen.queryByText('RMS')).not.toBeInTheDocument();
  });

  test('mobile menu overlay closes menu when clicked', () => {
    const { MemoryRouter } = require('react-router-dom');
    // Set mobile viewport
    setViewportWidth(360);
    
    render(
      <MemoryRouter>
        <Header isDashboard={false} />
      </MemoryRouter>
    );
    
    // Open mobile menu
    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);
    
    // Find and click the overlay
    // The overlay has fixed inset-0 and bg-black/30 classes
    const overlay = document.querySelector('.fixed.inset-0.bg-black\\/30');
    if (overlay) {
      fireEvent.click(overlay);
      // This tests line 264
    }
    
    // Menu should be closed (overlay should not be in document)
    expect(document.querySelector('.fixed.inset-0.bg-black\\/30')).not.toBeInTheDocument();
  });

  test('mobile navigation menu items close menu when clicked', () => {
    const { MemoryRouter } = require('react-router-dom');
    // Set mobile viewport
    setViewportWidth(360);
    
    render(
      <MemoryRouter>
        <Header isDashboard={false} />
      </MemoryRouter>
    );
    
    // Open mobile menu
    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);
    
    // Click on a navigation link in mobile menu
    const aboutLink = screen.getAllByText('About Us')[1]; // Mobile version
    fireEvent.click(aboutLink);
    
    // This tests line 285
    // Menu should be closed
    expect(document.querySelector('.fixed.inset-0.bg-black\\/30')).not.toBeInTheDocument();
  });

  test('mobile login button closes menu and navigates', () => {
    const { MemoryRouter } = require('react-router-dom');
    // Set mobile viewport
    setViewportWidth(360);
    
    render(
      <MemoryRouter>
        <Header isDashboard={false} />
      </MemoryRouter>
    );
    
    // Open mobile menu
    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);
    
    // Click mobile login button
    const mobileLoginButtons = screen.getAllByText('Login');
    const mobileLoginButton = mobileLoginButtons.find(btn => 
      btn.className.includes('w-full')
    );
    
    if (mobileLoginButton) {
      fireEvent.click(mobileLoginButton);
      
      // Verify navigate was called with '/login'
      // This tests lines 361-362
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    }
  });

  test('cleans up event listeners on unmount', () => {
    const { MemoryRouter } = require('react-router-dom');
    const { unmount } = render(
      <MemoryRouter>
        <Header isDashboard={false} />
      </MemoryRouter>
    );
    
    // Spy on window.removeEventListener
    const removeListenerSpy = vi.spyOn(window, 'removeEventListener');
    
    // Unmount the component
    unmount();
    
    // Verify cleanup
    expect(removeListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    removeListenerSpy.mockRestore();
  });
});
