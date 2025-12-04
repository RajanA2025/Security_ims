// DonutChart.test.jsx
import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { vi } from 'vitest'

// -------------------------------------------------------------
// 🎯 Mock echarts to avoid real DOM/canvas creation
// -------------------------------------------------------------
const setOptionMock = vi.fn()
const disposeMock = vi.fn()

vi.mock('echarts', () => {
  return {
    __esModule: true,
    init: vi.fn(() => ({
      setOption: setOptionMock,
      dispose: disposeMock
    }))
  }
})

import DonutChart from "c:/project/jit_ms1/Security_ims/src/components/dashboard/donutchart.jsx"
import * as echarts from 'echarts'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('DonutChart Component', () => {

  it('renders the chart container', () => {
    const { container } = render(<DonutChart />)

    const chartDiv = container.querySelector('div[style*="height: 250px"]')
    expect(chartDiv).toBeInTheDocument()
  })

  it('initializes echarts and calls setOption()', () => {
    render(<DonutChart />)

    // echarts.init should be called once
    expect(echarts.init).toHaveBeenCalledTimes(1)

    // setOption should be called with a pie series config
    expect(setOptionMock).toHaveBeenCalledTimes(1)

    const passedOption = setOptionMock.mock.calls[0][0]
    expect(passedOption).toHaveProperty('series')
    expect(passedOption.series[0].type).toBe('pie')
  })

  it('disposes chart on unmount', () => {
    const { unmount } = render(<DonutChart />)

    unmount()

    // dispose() should be called once
    expect(disposeMock).toHaveBeenCalledTimes(1)
  })
})
