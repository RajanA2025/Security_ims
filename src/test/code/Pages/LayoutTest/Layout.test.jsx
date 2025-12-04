// Layout.test.jsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Layout from 'c:/project/jit_ms1/Security_ims/src/Layout/Layout'

// Mock Header and Sidebar components (keep them lightweight and test-friendly)
vi.mock('c:/project/jit_ms1/Security_ims/src/components/Header', () => {
  return {
    default: ({ isExpanded, setIsExpanded, onDateChange }) => (
      <div data-testid="mock-header">
        <div data-testid="header-exp-state">{`headerReceived:${isExpanded}`}</div>
        <button
          data-testid="expand-btn"
          onClick={() => setIsExpanded(true)}
        >
          expand
        </button>
        <button
          data-testid="collapse-btn"
          onClick={() => setIsExpanded(false)}
        >
          collapse
        </button>
        <button
          data-testid="date-btn"
          onClick={() => onDateChange && onDateChange('2025-12-01')}
        >
          set-date
        </button>
      </div>
    )
  }
})

vi.mock('c:/project/jit_ms1/Security_ims/src/components/Sidebar', () => {
  return {
    default: ({ isExpanded }) => (
      <div data-testid="mock-sidebar">{`sidebarExpanded:${isExpanded}`}</div>
    )
  }
})

// Mock react-router-dom's Outlet so we don't need to create nested routes
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">outlet-content</div>
  }
})

describe('Layout component', () => {
  it('renders Header, Sidebar and Outlet', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )

    expect(screen.getByTestId('mock-header')).toBeInTheDocument()
    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('outlet')).toBeInTheDocument()
  })

  it('passes isExpanded state to Sidebar and updates when Header buttons call setIsExpanded', () => {
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    )

    // Initially sidebarExpanded:false
    const sidebar = screen.getByTestId('mock-sidebar')
    expect(sidebar.textContent).toBe('sidebarExpanded:false')

    // Click expand button from Header mock
    const expandBtn = screen.getByTestId('expand-btn')
    fireEvent.click(expandBtn)
    expect(sidebar.textContent).toBe('sidebarExpanded:true')

    // Click collapse button
    const collapseBtn = screen.getByTestId('collapse-btn')
    fireEvent.click(collapseBtn)
    expect(sidebar.textContent).toBe('sidebarExpanded:false')
  })

  it('forwards onDateChange to Header and the handler gets called', () => {
    const onDateChangeMock = vi.fn()
    render(
      <MemoryRouter>
        <Layout onDateChange={onDateChangeMock} />
      </MemoryRouter>
    )

    const dateBtn = screen.getByTestId('date-btn')
    fireEvent.click(dateBtn)

    expect(onDateChangeMock).toHaveBeenCalledWith('2025-12-01')
  })
})
