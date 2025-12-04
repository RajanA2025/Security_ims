// AntdNestedTable.test.jsx
import React from 'react'
import { render, screen, waitFor, act, cleanup } from '@testing-library/react'
import { vi } from 'vitest'
import AntdNestedTable from 'c:/project/jit_ms1/Security_ims/src/components/CostComponents/AntdNestedTable'
import axios from 'axios'

// -----------------------------
// Mocks
// -----------------------------

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

// Mock echarts-for-react to render a simple div (so we avoid heavy chart rendering)
vi.mock('echarts-for-react', () => {
  return {
    __esModule: true,
    default: (props) => {
      // Render minimal information so tests can assert chart presence
      return <div data-testid="mock-echarts">{JSON.stringify(props.option || {})}</div>
    }
  }
})

// Mock ResizeObserver used by the component
class FakeResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = FakeResizeObserver

// mock getBoundingClientRect used in scroll logic to avoid errors if tests trigger expand
Element.prototype.getBoundingClientRect = function () {
  // return a simple rectangle
  return { top: 0, left: 0, right: 0, bottom: 0, width: 100, height: 20 }
}

// mock scrollTo used on the container
window.HTMLElement.prototype.scrollTo = function () {}

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

// -----------------------------
// Helper sample payloads
// -----------------------------
const sampleResults = [
  {
    instance_id: 'i-1',
    instance_name: 'web-server',
    account_id: 'acc-1',
    cost: 10.5,
    vcpu: 2,
    ram: 4,
    volume_size: 20,
    instance_type: 't3.medium',
    environment: 'Production',
    cpu_history: [0.1, 0.2, 0.3, 0.2, 0.1],
    period: '2025-12'
  },
  {
    instance_id: 'i-2',
    instance_name: 'db-server',
    account_id: 'acc-2',
    cost: 25.0,
    vcpu: 4,
    ram: 8,
    volume_size: 50,
    instance_type: 'm5.large',
    environment: 'Non-Production',
    cpu_history: [0.05, 0.1, 0.15, 0.1, 0.05],
    period: '2025-12'
  }
]

// Default localStorage account_ids used by the component
const setLocalStorageAccounts = (value) => {
  localStorage.setItem('account_ids', JSON.stringify(value))
}

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks()
  cleanup()
  localStorage.clear()
})

// -----------------------------
// Tests
// -----------------------------
describe('AntdNestedTable', () => {
  it('renders chart and table tree (Cloud / Production) when API returns results', async () => {
    // prepare localStorage and axios mock
    setLocalStorageAccounts(['acc-1', 'acc-2'])
    mockedAxios.post.mockResolvedValueOnce({ data: { results: sampleResults } })

    await act(async () => {
      render(<AntdNestedTable selectedAccount={null} />)
    })

    // wait for the component to finish loading and rendering its processed tree
    await waitFor(() => {
      // Chart (mock) should be present
      expect(screen.getByTestId('mock-echarts')).toBeInTheDocument()
    })

    // Expect the "Cloud" root node to appear (constructed by buildTree/structuredEnv)
    expect(screen.getByText(/Cloud/i)).toBeInTheDocument()
    // Check that the chart is rendered with the expected data
    expect(screen.getByTestId('mock-echarts')).toBeInTheDocument()
    
    // Verify the aggregated cost is displayed
    expect(screen.getByText(/\$35\.50/)).toBeInTheDocument()

    // Verify axios called with expected endpoint and body
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://47.130.218.97:8002/instances/filter',
      expect.objectContaining({ account_ids: expect.any(Array) }),
      expect.any(Object)
    )
  })

  it('filters by selectedAccount prop and shows only that account data', async () => {
    // set localStorage for accounts (component will read these but selectedAccount overrides filter)
    setLocalStorageAccounts(['acc-1', 'acc-2'])
    mockedAxios.post.mockResolvedValueOnce({ data: { results: sampleResults } })

    await act(async () => {
      render(<AntdNestedTable selectedAccount="acc-1" />)
    })

    // wait for rendering
    await waitFor(() => {
      expect(screen.getByTestId('mock-echarts')).toBeInTheDocument()
    })

    // Check that the chart is rendered and shows only acc-1 data
    expect(screen.getByTestId('mock-echarts')).toBeInTheDocument()
    
    // Verify the filtered cost is displayed
    expect(screen.getByText(/\$10\.50/)).toBeInTheDocument()
  })

  it('shows "No Data Found" when API returns empty results', async () => {
    setLocalStorageAccounts(['acc-1'])
    mockedAxios.post.mockResolvedValueOnce({ data: { results: [] } })

    await act(async () => {
      render(<AntdNestedTable selectedAccount={null} />)
    })

    // Wait until component finishes loading and shows empty state
    await waitFor(() => {
      expect(screen.getByText(/No Data Found/i)).toBeInTheDocument()
    })

    // Chart should NOT be present in the "no data" case
    expect(screen.queryByTestId('mock-echarts')).toBeNull()
  })
})
