// CpuAvg.test.jsx
import React from 'react'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { vi } from 'vitest'
import CpuAvg from "c:/project/jit_ms1/Security_ims/src/components/cpuavg.jsx"

// -----------------------------
// Mocks & Test setup
// -----------------------------

// Mock echarts to avoid using the real lib (init, graphic.LinearGradient)
vi.mock('echarts', () => {
  return {
    __esModule: true,
    // init returns an object with setOption, dispose, resize so component logic can call it
    init: (el) => ({
      setOption: vi.fn(),
      dispose: vi.fn(),
      resize: vi.fn(),
    }),
    graphic: {
      LinearGradient: vi.fn(() => ({})),
    },
  }
})

// Provide a fake ResizeObserver used in component
class FakeResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = FakeResizeObserver

// Ensure getBoundingClientRect exists (some components rely on it)
Element.prototype.getBoundingClientRect = Element.prototype.getBoundingClientRect || function () {
  return { top: 0, left: 0, width: 800, height: 600, bottom: 600, right: 800 }
}

afterEach(() => {
  cleanup()
  vi.resetAllMocks()
  // restore fetch if replaced
  if (global.fetch && global.fetch.mockRestore) global.fetch.mockRestore?.()
})

// -----------------------------
// Helper factories
// -----------------------------
const makeInstancesWithin7Days = () => {
  const today = new Date()
  const arr = []
  // create some instances with launch_time set to last 7 days and cpu_avg_7d values
  for (let i = 0; i < 4; i++) {
    const dt = new Date(today)
    dt.setDate(today.getDate() - i) // within last 7 days
    arr.push({
      launch_time: dt.toISOString(),
      cpu_avg_7d: (i + 1) * 5, // 5,10,15,20
    })
  }
  return arr
}

// -----------------------------
// Tests
// -----------------------------
describe('CpuAvg component', () => {
  it('shows a loading spinner initially and then hides it after successful fetch (no error)', async () => {
    // mock fetch to return instances
    const instances = makeInstancesWithin7Days()
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => instances,
    })

    render(<CpuAvg />)

    // initial loading overlay (Spin) should be in the document
    expect(document.querySelector('.ant-spin')).toBeTruthy() // AntD Spin renders .ant-spin

    // wait until loading finishes
    await waitFor(() => {
      // After the fetch finishes, loading overlay should be removed
      expect(document.querySelector('.ant-spin')).toBeNull()
    })

    // There should be no Alert (no error)
    expect(screen.queryByRole('alert')).toBeNull()
    // The chart container div should exist
    const chartDiv = document.querySelector('div[style*="height: 400px"]')
    expect(chartDiv).toBeInTheDocument()
  })

  it('shows an error Alert when fetch fails and still clears loading', async () => {
    // make fetch reject to simulate network failure
    global.fetch = vi.fn().mockRejectedValue(new Error('network fail'))

    render(<CpuAvg />)

    // loading spinner shown initially
    expect(document.querySelector('.ant-spin')).toBeTruthy()

    // wait for effect to finish and error to be set
    await waitFor(() => {
      // loading overlay removed
      expect(document.querySelector('.ant-spin')).toBeNull()
      // Alert rendered
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveTextContent(/Failed to load CPU data/i)
    })

    // Chart container should still exist (component falls back to mock data)
    const chartDiv = document.querySelector('div[style*="height: 400px"]')
    expect(chartDiv).toBeInTheDocument()
  })
})
