// HalfPieChart.test.jsx
import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { vi } from 'vitest'

// -----------------------------
// Mock echarts
// -----------------------------
const setOptionMock = vi.fn()
const disposeMock = vi.fn()
const resizeMock = vi.fn()

vi.mock('echarts', () => {
  return {
    __esModule: true,
    init: vi.fn(() => ({
      setOption: setOptionMock,
      dispose: disposeMock,
      resize: resizeMock,
    })),
  }
})

import HalfPieChart from "c:/project/jit_ms1/Security_ims/src/components/dashboard/halfpiechart.jsx"
import * as echarts from 'echarts'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('HalfPieChart', () => {
  it('renders chart container', () => {
    const { container } = render(<HalfPieChart labels={['A','B']} data={[10,20]} />)
    const div = container.querySelector('div[style*="height: 250px"]')
    expect(div).toBeInTheDocument()
  })

  it('calls echarts.init and setOption with mapped labels/data', () => {
    render(<HalfPieChart labels={['Alpha','Beta','Gamma']} data={[5,15,30]} />)

    // init called
    expect(echarts.init).toHaveBeenCalledTimes(1)
    // setOption called
    expect(setOptionMock).toHaveBeenCalledTimes(1)

    const passedOption = setOptionMock.mock.calls[0][0]
    expect(passedOption).toHaveProperty('series')
    const series = passedOption.series[0]
    expect(series.type).toBe('pie')

    // verify series.data maps labels->data in order
    expect(series.data).toEqual([
      { value: 5, name: 'Alpha' },
      { value: 15, name: 'Beta' },
      { value: 30, name: 'Gamma' },
    ])
  })

  it('updates setOption when props change (effect dependency)', () => {
    const { rerender } = render(<HalfPieChart labels={['X']} data={[1]} />)
    expect(setOptionMock).toHaveBeenCalledTimes(1)

    // change props -> effect should run again and call setOption again
    rerender(<HalfPieChart labels={['X','Y']} data={[1,2]} />)
    expect(setOptionMock).toHaveBeenCalledTimes(2)

    const latest = setOptionMock.mock.calls[1][0]
    expect(latest.series[0].data).toEqual([
      { value: 1, name: 'X' },
      { value: 2, name: 'Y' },
    ])
  })

  it('disposes chart on unmount', () => {
    const { unmount } = render(<HalfPieChart labels={['a']} data={[1]} />)
    unmount()
    expect(disposeMock).toHaveBeenCalledTimes(1)
  })

  it('tooltip formatter formats correctly with name, value and percent', () => {
    render(<HalfPieChart labels={['Test','Demo']} data={[25,75]} />)

    const passedOption = setOptionMock.mock.calls[0][0]
    expect(passedOption).toHaveProperty('tooltip')
    
    const tooltip = passedOption.tooltip
    expect(tooltip.formatter).toBeDefined()
    expect(typeof tooltip.formatter).toBe('function')
    
    // Test the formatter function with mock params
    const mockParams = {
      name: 'Test',
      value: 25,
      percent: 25
    }
    const result = tooltip.formatter(mockParams)
    expect(result).toBe('Test: 25 (25%)')
    
    // Test with different values
    const mockParams2 = {
      name: 'Demo',
      value: 75,
      percent: 75
    }
    const result2 = tooltip.formatter(mockParams2)
    expect(result2).toBe('Demo: 75 (75%)')
  })
})
