// Savingdashmain.test.jsx
import React from 'react'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { vi } from 'vitest'
import '@testing-library/jest-dom'
import { CostContext } from "c:/project/jit_ms1/Security_ims/src/Context/CostContext.jsx"
import { Savingdashmain } from "c:/project/jit_ms1/Security_ims/src/components/CostComponents/Savingdashmain.jsx"

// Mock antd components to avoid responsive observer issues
vi.mock('antd', () => ({
  Row: ({ children, ...props }) => <div data-testid="row" {...props}>{children}</div>,
  Col: ({ children, ...props }) => <div data-testid="col" {...props}>{children}</div>,
  Card: ({ children, bodyStyle, style, ...props }) => <div data-testid="card" style={{...style, ...bodyStyle}} {...props}>{children}</div>,
  Typography: {
    Title: ({ children, ...props }) => <h4 data-testid="title" {...props}>{children}</h4>,
    Text: ({ children, ...props }) => <span data-testid="text" {...props}>{children}</span>,
  },
  Spin: ({ size, tip, children, ...props }) => <div data-testid="spin" {...props}>{children || tip}</div>,
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver

// Mock chart components so tests stay fast and deterministic
vi.mock("c:/project/jit_ms1/Security_ims/src/components/CostComponents/LogAxisChart.jsx", () => {
  return {
    __esModule: true,
    default: () => <div data-testid="mock-logaxis">LogAxisChart</div>
  }
})
vi.mock("c:/project/jit_ms1/Security_ims/src/components/CostComponents/SavingsTrendGraph.jsx", () => {
  return {
    __esModule: true,
    default: () => <div data-testid="mock-trend">SavingsTrendGraph</div>
  }
})

afterEach(() => {
  cleanup()
  vi.resetAllMocks()
  localStorage.clear()
})

describe('Savingdashmain', () => {
  it('shows loading spinner when loading is true', () => {
    render(
      <CostContext.Provider value={{ resourcesData: null, loading: true, error: null }}>
        <Savingdashmain />
      </CostContext.Provider>
    )

    // Check for the mocked spin element
    expect(screen.getByTestId('spin')).toBeInTheDocument()
    // Check for the loading text
    expect(screen.getByText('Loading savings data...')).toBeInTheDocument()
  })

  it('shows error message when error is present', () => {
    render(
      <CostContext.Provider value={{ resourcesData: null, loading: false, error: 'Boom' }}>
        <Savingdashmain />
      </CostContext.Provider>
    )

    expect(screen.getByText(/Error: Boom/i)).toBeInTheDocument()
  })

  it('computes and displays totals from resourcesData (no account filter)', async () => {
    // resourcesData shape: combine arrays as used by component
    const resourcesData = {
      underutilized_ec2: [
        { account_id: 'acc-1', cost_savings: 100, type: 'underutilized', status: 'assigned' },
        { account_id: 'acc-2', cost_savings: 200, type: 'underutilized', status: 'unassigned' }
      ],
      underutilized_ebs: [
        { account_id: 'acc-1', cost_savings: 50, type: 'underutilized', status: 'assigned' }
      ],
      orphaned_volumes: [
        { account_id: 'acc-2', cost_savings: 25, type: 'orphaned', status: 'unassigned' }
      ],
      orphaned_eips: [
        { account_id: 'acc-1', cost: 10, type: 'orphaned', status: 'assigned' }
      ],
      orphaned_snapshots: [
        { account_id: 'acc-2', cost_savings: 5, type: 'orphaned', status: 'unassigned' }
      ]
    }

    render(
      <CostContext.Provider value={{ resourcesData, loading: false, error: null }}>
        <Savingdashmain />
      </CostContext.Provider>
    )

    // totalPotentialSavings = 100+200+50+25+10+5 = 390
    // Use getAllByText since $390 appears multiple times
    expect(screen.getAllByText('$390').length).toBeGreaterThan(0)

    // totalOpportunities: code counts items with type === 'underutilized' or fallback length
    // here underutilized items = 3
    expect(screen.getByText('3')).toBeInTheDocument()

    // Implementation status numbers: assigned and unassigned sums
    // assigned costs: 100 (assigned ec2) + 50 (assigned ebs) + 10 (assigned eip) = 160
    // unassigned costs: 200 + 25 + 5 = 230
    // Total costs
    expect(screen.getAllByText('$390').length).toBeGreaterThan(0)
    // Assigned shown as $160
    expect(screen.getByText('$160')).toBeInTheDocument()
    // Unassigned shown as $230
    expect(screen.getByText('$230')).toBeInTheDocument()
  })

  it('filters resources by account_ids stored in localStorage', async () => {
    // Only include items from acc-1; store acc-1 in localStorage so others are filtered out
    localStorage.setItem('account_ids', JSON.stringify(['acc-1']))

    const resourcesData = {
      underutilized_ec2: [
        { account_id: 'acc-1', cost_savings: 100, type: 'underutilized', status: 'assigned' },
        { account_id: 'acc-2', cost_savings: 200, type: 'underutilized', status: 'unassigned' }
      ],
      underutilized_ebs: [],
      orphaned_volumes: [],
      orphaned_eips: [{ account_id: 'acc-1', cost: 10, type: 'orphaned', status: 'assigned' }],
      orphaned_snapshots: []
    }

    render(
      <CostContext.Provider value={{ resourcesData, loading: false, error: null }}>
        <Savingdashmain />
      </CostContext.Provider>
    )

    // Only acc-1 items should be considered: 100 + 10 = 110
    // Use getAllByText since $110 appears multiple times
    expect(screen.getAllByText('$110').length).toBeGreaterThan(0)

    // Number of opportunities: underutilized items filtered = 1
    expect(screen.getByText('1')).toBeInTheDocument()

    // Check that $0 is present for unassigned - use getAllByText since it appears multiple times
    expect(screen.getAllByText('$0').length).toBeGreaterThan(0)
  })

  it('handles missing resourcesData gracefully (shows Loading... placeholders)', async () => {
    render(
      <CostContext.Provider value={{ resourcesData: null, loading: false, error: null }}>
        <Savingdashmain />
      </CostContext.Provider>
    )

    // When resourcesData is null, titles are present and values show "Loading..."
    // Use getAllByText since "Potential Savings" appears multiple times
    expect(screen.getAllByText(/Potential Savings/i).length).toBeGreaterThan(0)
    // Check for multiple Loading... texts
    const loadingTexts = screen.getAllByText('Loading...')
    expect(loadingTexts.length).toBeGreaterThanOrEqual(1)
  })
})
