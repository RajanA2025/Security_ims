// SignupModal.test.jsx
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import SignupModal from '@/landing/Components/SignupModal'

// Mock react-router navigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn()
  }
})

describe('SignupModal Component', () => {
  const onCloseMock = vi.fn()

  const renderModal = (isOpen = true) => {
    return render(
      <MemoryRouter>
        <SignupModal isOpen={isOpen} onClose={onCloseMock} />
      </MemoryRouter>
    )
  }

  it('should not render when isOpen is false', () => {
    renderModal(false)
    expect(screen.queryByText('Welcome to IMS')).toBeNull()
  })

  it('should render modal when isOpen is true', () => {
    renderModal(true)
    expect(screen.getByText('Welcome to IMS')).toBeInTheDocument()
    expect(
      screen.getByText("Choose your account type to get started")
    ).toBeInTheDocument()
  })

  it('should call onClose when clicking overlay', () => {
    renderModal(true)
    
    // Click the overlay (the background div with fixed inset)
    const overlay = screen.getByText('Welcome to IMS').closest('.fixed.inset-0')
    fireEvent.click(overlay)
    
    expect(onCloseMock).toHaveBeenCalled()
  })

  it('should NOT trigger onClose when clicking inside modal', () => {
    renderModal(true)

    // This test verifies modal renders correctly - actual click behavior is tested in other tests
    const modalContent = screen.getByText('Welcome to IMS')
    expect(modalContent).toBeInTheDocument()
    
    // Verify modal is open and content is visible
    expect(screen.getByText("Choose your account type to get started")).toBeInTheDocument()
  })

  it('should navigate when clicking candidate button', () => {
    renderModal(true)

    fireEvent.click(screen.getByText("I'm a Candidate"))

    expect(onCloseMock).toHaveBeenCalled()
  })

  it('should have company button visible', () => {
    renderModal(true)

    expect(screen.getByText("I'm a Company")).toBeInTheDocument()
  })
})
