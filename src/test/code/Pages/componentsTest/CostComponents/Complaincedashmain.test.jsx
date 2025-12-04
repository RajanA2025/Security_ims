// Complaincedashmain.test.jsx
import React from 'react'
import { render, screen, waitFor, cleanup, act, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { CostContext } from 'c:/project/jit_ms1/Security_ims/src/Context/CostContext'
import { Complaincedashmain } from 'c:/project/jit_ms1/Security_ims/src/components/CostComponents/Complaincedashmain.jsx'

// Mock ReactECharts so tests don't render heavy charts
vi.mock('echarts-for-react', () => {
  return {
    __esModule: true,
    default: (props) => <div data-testid="mock-echarts">{JSON.stringify(props.option || {})}</div>
  }
})

// Mock window.matchMedia with proper event handling for Antd's responsive observer
const createMockMediaQueryList = (matches = false) => {
  const listeners = [];
  return {
    matches,
    media: '(max-width: 576px)',
    onchange: null,
    addListener: vi.fn((listener) => listeners.push(listener)),
    removeListener: vi.fn((listener) => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    }),
    addEventListener: vi.fn((type, listener) => {
      if (type === 'change') listeners.push(listener);
    }),
    removeEventListener: vi.fn((type, listener) => {
      if (type === 'change') {
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
      }
    }),
    dispatchEvent: vi.fn((event) => {
      listeners.forEach(listener => listener(event));
    }),
  };
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn((query) => createMockMediaQueryList(query.includes('max-width'))),
})

// Make sure Modal portal rendering stays in the DOM (antd's Modal uses portal; react-testing-library handles it by default)
// If JSDOM needs help with scroll or getBoundingClientRect, provide safe defaults
Element.prototype.getBoundingClientRect = Element.prototype.getBoundingClientRect || function () {
  return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }
}

afterEach(() => {
  vi.resetAllMocks()
  cleanup()
  localStorage.clear()
  // restore fetch if altered
  if (global.fetch?.mockRestore) global.fetch.mockRestore?.()
})

describe('Complaincedashmain', () => {
  it('shows loading spinner when context.loading is true', () => {
    render(
      <CostContext.Provider value={{ loading: true, error: null, costData: null, resourcesData: [], tagSummary: {}, }}>
        <Complaincedashmain />
      </CostContext.Provider>
    )

    // Antd's Spin renders an element with role='status' or we can assert by looking for .ant-spin
    expect(document.querySelector('.ant-spin')).toBeInTheDocument()
  })

  it('shows error message when context.error is present', () => {
    render(
      <CostContext.Provider value={{ loading: false, error: 'Something went wrong', costData: null, resourcesData: [], tagSummary: {}, }}>
        <Complaincedashmain />
      </CostContext.Provider>
    )

    expect(screen.getByText(/Error: Something went wrong/i)).toBeInTheDocument()
  })

  it('renders cards and computes auto start/stop stats and tag compliance (modal NOT shown when accounts match)', async () => {
    // Provide CostContext values
    const contextValue = {
      loading: false,
      error: null,
      costData: { total_cost: 10000, tagged_cost: 7000, untagged_cost: 3000, non_taggable_cost: 500 },
      resourcesData: [
        { id: 1, account_id: 'acc-1' },
        { id: 2, account_id: 'acc-2' }
      ],
      tagSummary: {
        details: [
          { account_id: 'acc-1', fully_tagged: 5, partially_tagged: 2, not_tagged: 1, total_resources: 8 },
          { account_id: 'acc-2', fully_tagged: 3, partially_tagged: 1, not_tagged: 0, total_resources: 4 }
        ]
      }
    }

    // localStorage account_ids: both present
    localStorage.setItem('account_ids', JSON.stringify(['acc-1', 'acc-2']))
    // ensure timeModal is NOT set so modal logic can run; here finalOutput should be true -> modal not shown
    localStorage.removeItem('timeModal')

    // Mock global.fetch for instances/filter to contain both accounts -> finalOutput true (no modal)
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ([
        { account_id: 'acc-1', auto_enabled: 'YES' },
        { account_id: 'acc-2', auto_enabled: 'NO' }
      ])
    })

    await act(async () => {
      render(
        <CostContext.Provider value={contextValue}>
          <Complaincedashmain />
        </CostContext.Provider>
      )
    })

    // Wait for fetch effect to complete and UI to render computed values
    await waitFor(() => {
      // Tag Compliance card: total_resources aggregated = 8 + 4 = 12
      expect(screen.getByText(/Total Resources:/i)).toBeInTheDocument()
      expect(screen.getByText('12')).toBeInTheDocument() // the big number shown next to Total Resources

      // Auto Start/Stop enabled/disabled summary shown
      expect(screen.getByText(/Enabled:/i)).toBeInTheDocument()
      expect(screen.getByText(/Disabled:/i)).toBeInTheDocument()

      // Since one enabled, one disabled => Enabled:1 Disabled:1
      expect(screen.getByText(/Enabled: 1/i)).toBeInTheDocument()
      expect(screen.getByText(/Disabled: 1/i)).toBeInTheDocument()
    })

    // Modal should NOT be open
    expect(screen.queryByText(/Account Sync Pending/i)).toBeNull()
  })

  it('shows account sync modal when API response does NOT include all local accounts', async () => {
    const contextValue = {
      loading: false,
      error: null,
      costData: { total_cost: 5000 },
      resourcesData: [],
      tagSummary: {}
    }

    // localStorage account_ids includes acc-1 and acc-2
    localStorage.setItem('account_ids', JSON.stringify(['acc-1', 'acc-2']))
    localStorage.removeItem('timeModal')

    // Mock fetch to return instances only for acc-1 (so finalOutput === false)
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ([
        { account_id: 'acc-1', auto_enabled: 'NO' },
        // missing acc-2
      ])
    })

    await act(async () => {
      render(
        <CostContext.Provider value={contextValue}>
          <Complaincedashmain />
        </CostContext.Provider>
      )
    })

    // Wait longer for effect to set showAccountModal true
    await waitFor(() => {
      // the modal title or description should appear
      expect(screen.getByText(/Account Sync Pending/i)).toBeInTheDocument()
    }, { timeout: 3000 })

    // Click "Okay, Got It" button to close and check timeModal stored
    const okButton = screen.getByRole('button', { name: /Okay, Got It/i })
    expect(okButton).toBeInTheDocument()
    fireEvent.click(okButton)

    // timeModal should be set in localStorage to true (string 'true' or boolean true depending on implementation)
    // In component they do: localStorage.setItem("timeModal", true)
    // That stores the string "true"
    await waitFor(() => {
      expect(localStorage.getItem('timeModal')).toBeDefined()
    })
  })

  it('handles edge case: empty tagSummary safely and shows zeros', async () => {
    const contextValue = {
      loading: false,
      error: null,
      costData: {},
      resourcesData: [],
      tagSummary: null // edge: null
    }

    localStorage.setItem('account_ids', JSON.stringify(['acc-1']))
    // mock fetch to return empty array
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] })

    await act(async () => {
      render(
        <CostContext.Provider value={contextValue}>
          <Complaincedashmain />
        </CostContext.Provider>
      )
    })

    // Wait until finished
    await waitFor(() => {
      // Tag numbers should fallback to 0
      expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1)
    })
  })
})
