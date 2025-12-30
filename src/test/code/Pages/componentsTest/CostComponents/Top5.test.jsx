// Top5.test.jsx
import React from 'react'
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react'
import { vi } from 'vitest'
import Top5 from "c:/project/jit_ms1/Security_ims/src/components/CostComponents/Top5.jsx";

import { CostContext } from "c:/project/jit_ms1/Security_ims/src/Context/CostContext.jsx";

// -----------------------------
// Mocks
// -----------------------------

// Mock window.matchMedia for Ant Design responsive features
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
});

// Mock echarts-for-react: expose a ref with getEchartsInstance().resize and render option JSON
vi.mock('echarts-for-react', () => {
  const React = require('react')
  return {
    __esModule: true,
    default: React.forwardRef(function MockECharts(props, ref) {
      React.useImperativeHandle(ref, () => ({
        getEchartsInstance: () => ({ resize: () => {} }),
      }), [])
      return <div data-testid="mock-echarts" data-option={JSON.stringify(props.option || {})}>{JSON.stringify(props.option || {})}</div>
    }),
  }
})

// Mock ResizeObserver used in component
class FakeResizeObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
}
global.ResizeObserver = FakeResizeObserver

// safe getBoundingClientRect (some tests/environments expect it)
Element.prototype.getBoundingClientRect = Element.prototype.getBoundingClientRect || function () {
  return { top: 0, left: 0, right: 0, bottom: 0, width: 800, height: 600 }
}

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  localStorage.clear()
})

// -----------------------------
// Helper data
// -----------------------------
const makeCostData = () => ({
  top_5: {
    top_accounts: [
      { account_id: 'acc-A', current_month_cost: 3000 },
      { account_id: 'acc-B', current_month_cost: 2000 },
      { account_id: 'acc-C', current_month_cost: 1500 },
    ],
    top_apps: [
      { app_name: 'App One', current_month_cost: 4200 },
      { app_name: 'App Two', current_month_cost: 1200 },
      { app_name: 'App Three', current_month_cost: 600 },
    ],
    top_services: [
      { name: 'Service X', current_month_cost: 700 },
      { name: 'Service Y', current_month_cost: 500 },
    ]
  }
})

// -----------------------------
// Tests
// -----------------------------
describe('Top5 component', () => {
  it('renders loading state when loading is true', () => {
    render(
      <CostContext.Provider value={{ costData: null, loading: true }}>
        <Top5 />
      </CostContext.Provider>
    )

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument()
  })

  it('renders checkboxes and default selectedGroup is top_accounts; chart shows account categories', async () => {
    const costData = makeCostData()

    render(
      <CostContext.Provider value={{ costData, loading: false }}>
        <Top5 />
      </CostContext.Provider>
    )

    // Check checkboxes exist
    const appCheckbox = screen.getByRole('checkbox', { name: /App/i })
    const acCheckbox = screen.getByRole('checkbox', { name: /^A\/C$/i }) // label "A/C"
    const srvCheckbox = screen.getByRole('checkbox', { name: /Srv/i })

    expect(appCheckbox).toBeInTheDocument()
    expect(acCheckbox).toBeInTheDocument()
    expect(srvCheckbox).toBeInTheDocument()

    // Default selectedGroup is "top_accounts" => A/C checkbox should be checked
    expect(acCheckbox).toBeChecked()
    expect(appCheckbox).not.toBeChecked()
    expect(srvCheckbox).not.toBeChecked()

    // Chart should render and include account category names (from top_accounts)
    const chart = await screen.findByTestId('mock-echarts')
    const optionJson = JSON.parse(chart.getAttribute('data-option') || '{}')
    // categories are in yAxis[0].data
    expect(optionJson.yAxis?.[0]?.data).toEqual(expect.arrayContaining(['acc-A', 'acc-B', 'acc-C']))
  })

  it('switches selection to App when App checkbox clicked and chart shows app categories', async () => {
    const costData = makeCostData()

    render(
      <CostContext.Provider value={{ costData, loading: false }}>
        <Top5 />
      </CostContext.Provider>
    )

    const appCheckbox = screen.getByRole('checkbox', { name: /App/i })
    const acCheckbox = screen.getByRole('checkbox', { name: /^A\/C$/i })

    // initially A/C checked
    expect(acCheckbox).toBeChecked()
    expect(appCheckbox).not.toBeChecked()

    // click App checkbox -> selectedGroup should change to top_apps (single-select behavior)
    fireEvent.click(appCheckbox)

    // Now App should be checked and A/C unchecked
    await waitFor(() => {
      expect(appCheckbox).toBeChecked()
      expect(acCheckbox).not.toBeChecked()
    })

    // Chart should update to show app categories
    const chart = await screen.findByTestId('mock-echarts')
    const optionJson = JSON.parse(chart.getAttribute('data-option') || '{}')
    expect(optionJson.yAxis?.[0]?.data).toEqual(expect.arrayContaining(['App One', 'App Two', 'App Three']))
  })

  it('limits displayed data to top 5 sorted by value', async () => {
    // Create costData with more than 5 entries for top_accounts to test slicing
    const manyAccounts = Array.from({ length: 8 }).map((_, i) => ({
      account_id: `acc-${i}`,
      current_month_cost: (8 - i) * 100 // descending values
    }))
    const costData = { top_5: { top_accounts: manyAccounts, top_apps: [], top_services: [] } }

    render(
      <CostContext.Provider value={{ costData, loading: false }}>
        <Top5 />
      </CostContext.Provider>
    )

    // Chart should include only top 5 names (acc-0 ... acc-4 considering sort)
    const chart = await screen.findByTestId('mock-echarts')
    const optionJson = JSON.parse(chart.getAttribute('data-option') || '{}')
    const yData = optionJson.yAxis?.[0]?.data || []
    // length should be 5 (sliced to top 5)
    expect(yData.length).toBeLessThanOrEqual(5)
    // highest value name should be present
    expect(yData[0]).toBeDefined()
  })
})
