// ProtectedRoute.test.jsx
import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

// Mock AuthContext's useAuth()
vi.mock("c:/project/jit_ms1/Security_ims/src/Context/AuthContext.jsx", () => ({
  useAuth: vi.fn()
}))

import { useAuth } from "c:/project/jit_ms1/Security_ims/src/Context/AuthContext.jsx"
import ProtectedRoute from "c:/project/jit_ms1/Security_ims/src/components/ProtectedRoute.jsx"

describe('ProtectedRoute', () => {

  it('redirects to /login when user is NOT authenticated', () => {
    useAuth.mockReturnValue({ isAuthenticated: false })

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <ProtectedRoute>
          <div>Secret Page</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    // Navigate component renders nothing but updates location
    // So ensure the protected content is NOT shown
    expect(screen.queryByText('Secret Page')).not.toBeInTheDocument()
  })

  it('renders children when user IS authenticated', () => {
    useAuth.mockReturnValue({ isAuthenticated: true })

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Secret Page</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    // Now the protected content should appear
    expect(screen.getByText('Secret Page')).toBeInTheDocument()
  })
})
