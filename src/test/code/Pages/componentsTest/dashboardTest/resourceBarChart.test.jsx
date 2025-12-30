// ResourceBarChart.test.jsx
import React from 'react'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { vi } from 'vitest'

// -----------------------------
// Mock echarts
// -----------------------------
const setOptionMock = vi.fn()
const disposeMock = vi.fn()

vi.mock('echarts', () => {
  return {
    __esModule: true,
    init: vi.fn(() => ({
      setOption: setOptionMock,
      dispose: disposeMock,
    })),
  }
})

import ResourceBarChart from "c:/project/jit_ms1/Security_ims/src/components/dashboard/resourceBarChart.jsx"
import * as echarts from 'echarts'

// Provide ResizeObserver shim if needed
class FakeResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = FakeResizeObserver

// Provide safe getBoundingClientRect
Element.prototype.getBoundingClientRect =
  Element.prototype.getBoundingClientRect ||
  function () {
    return { top: 0, left: 0, width: 800, height: 600, right: 800, bottom: 600 }
  }

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  // clear fetch mock
  if (global.fetch && global.fetch.mockClear) global.fetch.mockClear()
  delete global.fetch
})

describe('ResourceBarChart', () => {
  it('shows loading spinner while fetching and renders chart with correct data on success', async () => {
    // Prepare successful fetch responses for keypairs, eips, volumes
    const keyPairs = [{ id: 1, status: 'Orphaned' }, { id: 2, status: 'Active' }, { id: 3, status: 'Orphaned' }] // orphaned count: 2
    const eips = [{ id: 'e1' }, { id: 'e2' }] // count: 2
    const volumes = [{ id: 'v1' }, { id: 'v2' }, { id: 'v3' }] // count: 3

    global.fetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => keyPairs,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => eips,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => volumes,
      })

    render(<ResourceBarChart />)

    // Loading spinner should be visible initially
    expect(document.querySelector('.ant-spin')).toBeTruthy()

    // Wait for fetches to complete and chart effect to run
    await waitFor(() => {
      // loading overlay removed
      expect(document.querySelector('.ant-spin')).toBeNull()
    })

    // echarts.init should have been called
    expect(echarts.init).toHaveBeenCalledTimes(1)

    // setOption should be called once with series data equal to [orphanedKeyPairs, orphanedElasticIPs, orphanedVolumes]
    await waitFor(() => {
      expect(setOptionMock).toHaveBeenCalledTimes(1)
      const option = setOptionMock.mock.calls[0][0]
      expect(option).toHaveProperty('series')
      const seriesData = option.series[0].data
      // expected: [2, 2, 3]
      expect(seriesData).toEqual([2, 2, 3])
    })
  })

  it('shows error Alert when any fetch returns non-ok and does not call setOption', async () => {
    // Simulate first fetch failing (non-ok)
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'server error' }),
    })

    render(<ResourceBarChart />)

    // Loading spinner initially present
    expect(document.querySelector('.ant-spin')).toBeTruthy()

    // Wait for effect to finish
    await waitFor(() => {
      // spinner gone
      expect(document.querySelector('.ant-spin')).toBeNull()
    })

    // Alert should be present with "Failed to load data" or the error message
    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveTextContent(/Failed to load data/i)

    // echarts.setOption should NOT be called because chart effect runs only when !loading && !error
    expect(setOptionMock).not.toHaveBeenCalled()
  })

  it('disposes echarts instance on unmount after successful render', async () => {
    const keyPairs = [{ id: 1, status: 'Orphaned' }]
    const eips = []
    const volumes = []

    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => keyPairs })
      .mockResolvedValueOnce({ ok: true, json: async () => eips })
      .mockResolvedValueOnce({ ok: true, json: async () => volumes })

    const { unmount } = render(<ResourceBarChart />)

    // Wait for fetches and chart init
    await waitFor(() => {
      expect(setOptionMock).toHaveBeenCalled()
    })

    // Unmount and expect dispose called
    unmount()
    expect(disposeMock).toHaveBeenCalledTimes(1)
  })
})
