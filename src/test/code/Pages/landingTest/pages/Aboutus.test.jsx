// AboutUs.test.jsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import AboutUs from "c:/project/jit_ms1/Security_ims/src/landing/pages/Aboutus"

// Mock IntersectionObserver for Framer Motion
global.IntersectionObserver = class MockIntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock react-router-dom's useNavigate
const navigateMock = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('AboutUs component', () => {
  beforeEach(() => {
    navigateMock.mockClear()
  })

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <AboutUs />
      </MemoryRouter>
    )

  it('renders hero heading and subtext', () => {
    renderComponent()
    expect(
      screen.getByRole('heading', { name: /About JIT Global Info Systems/i })
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        /For over a decade, we've been at the forefront of IT innovation/i
      )
    ).toBeInTheDocument()
  })

  it('has Get Started button which navigates to /candidate-register', () => {
    renderComponent()
    const startBtn = screen.getByRole('button', { name: /Get Started/i })
    expect(startBtn).toBeInTheDocument()

    fireEvent.click(startBtn)
    expect(navigateMock).toHaveBeenCalledWith('/candidate-register')
  })

  it('has Contact Us button which navigates to /contact', () => {
    renderComponent()
    const contactBtn = screen.getByRole('button', { name: /Contact Us/i })
    expect(contactBtn).toBeInTheDocument()

    fireEvent.click(contactBtn)
    expect(navigateMock).toHaveBeenCalledWith('/contact')
  })

  it('renders stats cards with expected numbers and labels', () => {
    renderComponent()
    // Check at least one stat number and label from the stats array
    expect(screen.getByText(/10\+/)).toBeInTheDocument()
    expect(screen.getByText(/Years Experience/i)).toBeInTheDocument()
    expect(screen.getByText(/500\+/)).toBeInTheDocument()
    expect(screen.getByText(/Companies Served/i)).toBeInTheDocument()
  })

  it('renders values cards (People First, Innovation, Results Driven, Global Impact)', () => {
    renderComponent()
    expect(screen.getByText(/People First/i)).toBeInTheDocument()
    // Use getAllByText for Innovation since it appears in multiple places
    expect(screen.getAllByText(/Innovation/i)).toHaveLength(2)
    expect(screen.getByText(/Results Driven/i)).toBeInTheDocument()
    expect(screen.getByText(/Global Impact/i)).toBeInTheDocument()
  })

  it('renders timeline milestones', () => {
    renderComponent()
    // check for the years/titles provided
    expect(screen.getByText(/2011/)).toBeInTheDocument()
    expect(screen.getByText(/Company Founded/i)).toBeInTheDocument()
    expect(screen.getByText(/2018/)).toBeInTheDocument()
    // At least one description check
    expect(screen.getAllByText(/JIT Global Info Systems established/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders leadership team cards with images and alt text', () => {
    renderComponent()
    // Team member names
    expect(screen.getByText(/Dr N\. Marie Wilson/i)).toBeInTheDocument()
    expect(screen.getByText(/Karthik Palani/i)).toBeInTheDocument()
    expect(screen.getByText(/Easwar Sivanandam/i)).toBeInTheDocument()

    // Images have alt texts that include the name (ensures accessible images)
    const images = screen.getAllByRole('img')
    expect(images.some(img => /Dr N\. Marie Wilson/i.test(img.alt))).toBe(true)
    expect(images.some(img => /Karthik Palani/i.test(img.alt))).toBe(true)
    expect(images.some(img => /Easwar Sivanandam/i.test(img.alt))).toBe(true)
  })

  it('does not show contact modal form by default', () => {
    renderComponent()
    // since modal is controlled by internal state and not toggled, the form fields should not be present initially
    expect(screen.queryByLabelText(/Full Name \*/i)).toBeNull()
    expect(screen.queryByLabelText(/Email Address \*/i)).toBeNull()
  })
})
