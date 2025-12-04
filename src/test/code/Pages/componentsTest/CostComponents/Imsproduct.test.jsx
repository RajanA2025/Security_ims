// Imsproduct.test.jsx
import React from 'react'
import { render, screen, waitFor, act, fireEvent, cleanup, within } from '@testing-library/react'
import { vi } from 'vitest'
import Imsproduct from 'c:/project/jit_ms1/Security_ims/src/components/CostComponents/Imsproduct.jsx'
import axios from 'axios'

// -----------------------------
// Mocks
// -----------------------------
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

// Mock framer-motion to disable animations
vi.mock('framer-motion', () => {
  const React = require('react')
  return {
    motion: {
      div: React.forwardRef(({ children, ...props }, ref) => <div ref={ref} {...props}>{children}</div>),
      span: React.forwardRef(({ children, ...props }, ref) => <span ref={ref} {...props}>{children}</span>),
    },
    AnimatePresence: ({ children }) => children,
  }
})

// Mock IntersectionObserver for framer-motion
global.IntersectionObserver = class {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock window.matchMedia for Antd's responsive hooks
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

const navigateMock = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

// provide safe getBoundingClientRect used by antd/modal/animations if needed
Element.prototype.getBoundingClientRect = Element.prototype.getBoundingClientRect || function () {
  return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }
}

afterEach(() => {
  vi.clearAllMocks()
  cleanup()
  localStorage.clear()
})

// -----------------------------
// Tests
// -----------------------------
describe('Imsproduct component', () => {
  it('shows "Add Account" top button when the initial account check finds accounts', async () => {
    // set company_cid in localStorage and pillars so cost/security clickable states not needed here
    localStorage.setItem('company_cid', JSON.stringify('CID-1'))
    // mock stored pillars (not necessary for button presence, but safe)
    localStorage.setItem('pillars', JSON.stringify({ cost: true, security: true, operational_excellence: true, performance: true }))

    // Mock fetch for initial accounts check to return accounts array
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ accounts: [{ account_id: 'acc-1' }] }),
    })

    await act(async () => {
      render(<Imsproduct />)
    })

    // Wait for effect to complete and button to appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Account/i })).toBeInTheDocument()
    }, { timeout: 5000 })
    
    // Click should navigate to accounts route
    const addBtn = screen.getByRole('button', { name: /Add Account/i })
    fireEvent.click(addBtn)
    expect(navigateMock).toHaveBeenCalledWith('/imsproduct/accounts')
  })

  it('shows "No Account Found" modal when initial account check returns empty and Create Account navigates', async () => {
    localStorage.setItem('company_cid', JSON.stringify('CID-2'))
    localStorage.setItem('pillars', JSON.stringify({ cost: true, security: true }))

    // initial fetch returns empty accounts
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ accounts: [] }),
    })

    await act(async () => {
      render(<Imsproduct />)
    })

    // Modal should appear with title "No Account Found"
    await waitFor(() => {
      expect(screen.getByText(/No Account Found/i)).toBeInTheDocument()
      expect(screen.getByText(/You don’t have any accounts yet/i)).toBeInTheDocument()
    }, { timeout: 10000 })

    // Click "Create Account" button in modal footer - expects navigation to /imsproduct/accounts
    const createBtn = screen.getByRole('button', { name: /Create Account/i })
    expect(createBtn).toBeInTheDocument()
    fireEvent.click(createBtn)
    expect(navigateMock).toHaveBeenCalledWith('/imsproduct/accounts')
  })

  it('handleCardClick stores account_ids and navigates when axios returns accounts for a pillar', async () => {
    // Enable security pillar via stored pillars
    localStorage.setItem('pillars', JSON.stringify({ cost: false, security: true, operational_excellence: false, performance: false }))
    localStorage.setItem('company_cid', JSON.stringify('CID-3'))

    // Mock initial fetch for "hasAccount" call to return accounts (so no initial modal)
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ accounts: [{ account_id: 'acc-9' }] })
    })

    // Mock axios GET for pillar endpoint to return accounts array for the pillar 'security'
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        accounts: [{ account_id: 'sec-1' }, { account_id: 'sec-2' }]
      }
    })

    await act(async () => {
      render(<Imsproduct />)
    })

    // Wait for render - look for security card content
    await waitFor(() => {
      // Look for security-related content that should be present
      expect(screen.getByText(/IMS security/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    // Click the security card area - the onClick is on the motion div; find the card by title and click its parent
    const securityTitle = screen.getByText('Security')
    const securityCard = securityTitle.closest('.ant-card') || securityTitle.parentElement
    expect(securityCard).toBeTruthy()

    await act(async () => {
      fireEvent.click(securityCard)
    })

    // axios.get should have been called with expected URL pattern containing pillar
    expect(mockedAxios.get).toHaveBeenCalled()
    // account_ids should be stored in localStorage
    const stored = JSON.parse(localStorage.getItem('account_ids') || '[]')
    expect(stored).toEqual(['sec-1', 'sec-2'])
    // navigate should go to /security (pillar route)
    expect(navigateMock).toHaveBeenCalledWith('/security')
  }, 10000)

  it('handleCardClick shows "Add Account Required" modal when pillar API returns empty', async () => {
    // Enable cost pillar
    localStorage.setItem('pillars', JSON.stringify({ cost: true }))
    localStorage.setItem('company_cid', JSON.stringify('CID-4'))

    // initial fetch returns accounts (prevents No Account Found)
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ accounts: [{ account_id: 'acc-X' }] })
    })

    // axios.get returns empty accounts list for cost pillar
    mockedAxios.get.mockResolvedValueOnce({ data: { accounts: [] } })

    await act(async () => {
      render(<Imsproduct />)
    })

    // Wait for render - look for any card content instead of specific text
    await waitFor(() => {
      // Look for any card body or the Cost Cloud text which should be present
      expect(screen.getByText(/Cost Cloud/i)).toBeInTheDocument()
    }, { timeout: 5000 })

    // Click cost card (enabled from pillars)
    const costTitle = screen.getByText('Cost')
    const costCard = costTitle.closest('.ant-card') || costTitle.parentElement
    await act(async () => {
      fireEvent.click(costCard)
    })

    // Now "Add Account Required" modal should be shown
    await waitFor(() => {
      expect(screen.getByText(/Add Account Required/i)).toBeInTheDocument()
      expect(screen.getByText(/You need to add at least one account to access this pillar’s features/i)).toBeInTheDocument()
    }, { timeout: 10000 })

    // Click the Add Account button in that modal to navigate
    const modal = screen.getByText(/Add Account Required/i).closest('.ant-modal')
    const addBtn = within(modal).getByText('Add Account')
    fireEvent.click(addBtn)
    expect(navigateMock).toHaveBeenCalledWith('/imsproduct/accounts')
  }, 10000)
})
