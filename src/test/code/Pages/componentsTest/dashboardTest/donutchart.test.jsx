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

  it('tests tooltip formatter function', () => {
    render(<DonutChart />)

    // Get the option passed to setOption
    const passedOption = setOptionMock.mock.calls[0][0]
    
    // The tooltip formatter should be a function
    expect(passedOption.tooltip.formatter).toBeDefined()
    expect(typeof passedOption.tooltip.formatter).toBe('function')

    // Test the formatter with array value
    const mockParamsArray = {
      name: 'Available',
      value: [12, 24.5]
    }
    const resultArray = passedOption.tooltip.formatter(mockParamsArray)
    expect(resultArray).toBe('Available: 24.50')

    // Test the formatter with single value - use toBeCloseTo for floating point
    const mockParamsSingle = {
      name: 'Attached', 
      value: 17.345
    }
    const resultSingle = passedOption.tooltip.formatter(mockParamsSingle)
    // Extract the numeric part and check it's close to expected
    const numericValue = parseFloat(resultSingle.split(': ')[1])
    expect(numericValue).toBeCloseTo(17.35, 1) // Use 1 decimal place tolerance
    expect(resultSingle).toContain('Attached:')
  })

  it('tests chart configuration structure', () => {
    render(<DonutChart />)

    const passedOption = setOptionMock.mock.calls[0][0]

    // Test tooltip configuration
    expect(passedOption.tooltip.trigger).toBe('item')
    expect(passedOption.tooltip.textStyle.fontSize).toBe(10)
    expect(passedOption.tooltip.textStyle.fontWeight).toBe(500)

    // Test title configuration
    expect(passedOption.title.subtext).toBe('AMI Status')
    expect(passedOption.title.left).toBe('center')
    expect(passedOption.title.subtextStyle.fontSize).toBe(14)
    expect(passedOption.title.subtextStyle.color).toBe('#000000ff')

    // Test legend configuration
    expect(passedOption.legend.bottom).toBe('1%')
    expect(passedOption.legend.orient).toBe('horizontal')
    expect(passedOption.legend.left).toBe('center')
    expect(passedOption.legend.icon).toBe('circle')

    // Test series configuration
    expect(passedOption.series).toHaveLength(1)
    expect(passedOption.series[0].name).toBe('Orphaned Volume')
    expect(passedOption.series[0].type).toBe('pie')
    expect(passedOption.series[0].radius).toEqual(['40%', '70%'])
    expect(passedOption.series[0].label.formatter).toBe('{d}%')
    expect(passedOption.series[0].label.position).toBe('inside')

    // Test data
    expect(passedOption.series[0].data).toEqual([
      { value: 12, name: 'Available' },
      { value: 17, name: 'Attached' },
      { value: 34, name: 'Deleted' }
    ])

    // Test colors
    expect(passedOption.color).toEqual([
      '#5cf6f1ff',
      '#22c55e', 
      '#facc15',
      '#f97316',
      '#afef40ff',
      '#0284c7',
      '#070808ff',
      '#0ea5e9',
      '#14b8a6'
    ])
  })

  it('tests chart styling and item configuration', () => {
    render(<DonutChart />)

    const passedOption = setOptionMock.mock.calls[0][0]
    const series = passedOption.series[0]

    // Test label styling
    expect(series.label.fontSize).toBe(12)
    expect(series.label.fontWeight).toBe('bold')
    expect(series.label.color).toBe('#000')
    expect(series.label.fontFamily).toBe('Roboto, sans-serif')

    // Test item style
    expect(series.itemStyle.borderRadius).toBe(6)
    expect(series.itemStyle.borderColor).toBe('#fff')
    expect(series.itemStyle.borderWidth).toBe(2)

    // Test other series properties
    expect(series.avoidLabelOverlap).toBe(false)
    expect(series.labelLine.show).toBe(false)
  })
})
