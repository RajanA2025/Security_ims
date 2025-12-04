// Home.test.jsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import Home from '@/landing/pages/Home'

// Mock IntersectionObserver for Framer Motion
global.IntersectionObserver = class MockIntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock Header to keep tests isolated and fast
vi.mock('@/landing/Components/Header', () => {
  return {
    default: () => <div data-testid="mock-header">Header</div>
  }
})

// Mock react-router-dom's useNavigate
const navigateMock = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('Home component', () => {
  beforeEach(() => {
    navigateMock.mockClear()
  })

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )

  it('renders Header and hero content', () => {
    renderComponent()
    expect(screen.getByTestId('mock-header')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /Simplify Infrastructure with IMS/i })
    ).toBeInTheDocument()
    expect(screen.getByText(/Your complete solution for smarter, faster, and more efficient IT infrastructure management/i)).toBeInTheDocument()
  })

  it('navigates to /candidate-register when primary Get Started clicked', () => {
    renderComponent()
    const startBtn = screen.getAllByRole('button', { name: /Get Started/i })[0]
    expect(startBtn).toBeInTheDocument()
    fireEvent.click(startBtn)
    expect(navigateMock).toHaveBeenCalledWith('/candidate-register')
  })

  it('navigates to /about when Learn More clicked', () => {
    renderComponent()
    const learnBtn = screen.getByRole('button', { name: /Learn More/i })
    expect(learnBtn).toBeInTheDocument()
    fireEvent.click(learnBtn)
    expect(navigateMock).toHaveBeenCalledWith('/about')
  })

  it('renders features cards (images and descriptions)', () => {
    renderComponent()
    // There are 3 feature cards in the component mapping
    const featureImages = screen.getAllByRole('img').filter(img => /Teamwork|Office|Analytics|Smart|Multi/i.test(img.alt || img.src))
    expect(featureImages.length).toBeGreaterThanOrEqual(3)
    // Basic check for a feature description text
    expect(screen.getByText(/Track, monitor, and optimize all your IT assets/i)).toBeInTheDocument()
    expect(screen.getByText(/Real-time insights and performance metrics/i)).toBeInTheDocument()
  })

  it('renders testimonials with names and texts', () => {
    renderComponent()
    expect(screen.getByText(/Mr John/i)).toBeInTheDocument()
    expect(screen.getByText(/IMS made our hiring process so much faster and easier/i)).toBeInTheDocument()
    expect(screen.getByText(/Mr Chen/i)).toBeInTheDocument()
    expect(screen.getByText(/The analytics and automation features are a game changer/i)).toBeInTheDocument()
  })

  it('CTA section Get Started navigates to /candidate-register', () => {
    renderComponent()
    // The CTA Get Started is another button with same label — pick the one in CTA by checking visible text
    const allStarts = screen.getAllByRole('button', { name: /Get Started/i })
    // there should be at least two; click the last one (CTA)
    const ctaBtn = allStarts[allStarts.length - 1]
    fireEvent.click(ctaBtn)
    expect(navigateMock).toHaveBeenCalledWith('/candidate-register')
  })
})
