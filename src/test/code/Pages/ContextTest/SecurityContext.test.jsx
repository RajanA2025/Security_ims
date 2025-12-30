// SecurityContext.test.jsx
import React, { useContext } from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { vi } from 'vitest'
import { SecurityProvider, useSecurityContext } from 'c:/project/jit_ms1/Security_ims/src/Context/SecurityContext'

// Mock the api module
vi.mock('c:/project/jit_ms1/Security_ims/src/lib/api', () => {
  return {
    default: {
      get: vi.fn()
    }
  }
})
import api from 'c:/project/jit_ms1/Security_ims/src/lib/api'

describe('SecurityContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  // Consumer to call context methods and show result text
  const Consumer = () => {
    const {
      apiBaseUrl,
      endpoints,
      getSecurityGroups,
      getCloudTrail,
      getIamInsights,
      getSecurityTools,
    } = useSecurityContext()

    // Instead of using the exported hook (we'll test hook separately),
    // useContext with SecurityContext for a plain consumer inside provider.
    // But easier: use exported hook - safer and clearer:
    // const ctx = useSecurityContext()

    return (
      <div>
        <div data-testid="apiBaseUrl">{String(apiBaseUrl)}</div>
        <div data-testid="endpoint-securityGroups">{endpoints.securityGroups}</div>

        <button
          data-testid="call-securityGroups"
          onClick={async () => {
            const r = await getSecurityGroups({ a: 1 })
            const el = document.getElementById('securityGroups-result')
            if (el) el.textContent = JSON.stringify(r)
          }}
        />
        <div id="securityGroups-result" data-testid="securityGroups-result" />

        <button
          data-testid="call-cloudTrail"
          onClick={async () => {
            const r = await getCloudTrail({ b: 2 })
            const el = document.getElementById('cloudTrail-result')
            if (el) el.textContent = JSON.stringify(r)
          }}
        />
        <div id="cloudTrail-result" data-testid="cloudTrail-result" />

        <button
          data-testid="call-iam"
          onClick={async () => {
            const r = await getIamInsights({ c: 3 })
            const el = document.getElementById('iam-result')
            if (el) el.textContent = JSON.stringify(r)
          }}
        />
        <div id="iam-result" data-testid="iam-result" />

        <button
          data-testid="call-tools"
          onClick={async () => {
            const r = await getSecurityTools({ d: 4 })
            const el = document.getElementById('tools-result')
            if (el) el.textContent = JSON.stringify(r)
          }}
        />
        <div id="tools-result" data-testid="tools-result" />
      </div>
    )
  }

  it('exposes endpoints and apiBaseUrl through provider', () => {
    render(
      <SecurityProvider>
        <Consumer />
      </SecurityProvider>
    )

    // apiBaseUrl should render (may be undefined in test env)
    expect(screen.getByTestId('apiBaseUrl')).toBeInTheDocument()
    // endpoints mapping present
    expect(screen.getByTestId('endpoint-securityGroups').textContent).toBe('/security-groups')
  })

  it('getSecurityGroups calls api.get with correct endpoint and params and returns data', async () => {
    const fakeData = { items: [{ id: 1 }] }
    api.get.mockResolvedValueOnce({ data: fakeData })

    render(
      <SecurityProvider>
        <Consumer />
      </SecurityProvider>
    )

    await act(async () => {
      screen.getByTestId('call-securityGroups').click()
    })

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/security-groups', { params: { a: 1 } })
      expect(screen.getByTestId('securityGroups-result').textContent).toBe(JSON.stringify(fakeData))
    })
  })

  it('getCloudTrail calls api.get with correct endpoint and params and returns data', async () => {
    const fakeData = { trail: true }
    api.get.mockResolvedValueOnce({ data: fakeData })

    render(
      <SecurityProvider>
        <Consumer />
      </SecurityProvider>
    )

    await act(async () => {
      screen.getByTestId('call-cloudTrail').click()
    })

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/cloud-trail', { params: { b: 2 } })
      expect(screen.getByTestId('cloudTrail-result').textContent).toBe(JSON.stringify(fakeData))
    })
  })

  it('getIamInsights calls api.get with correct endpoint and params and returns data', async () => {
    const fakeData = { insights: [] }
    api.get.mockResolvedValueOnce({ data: fakeData })

    render(
      <SecurityProvider>
        <Consumer />
      </SecurityProvider>
    )

    await act(async () => {
      screen.getByTestId('call-iam').click()
    })

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/iam-insights', { params: { c: 3 } })
      expect(screen.getByTestId('iam-result').textContent).toBe(JSON.stringify(fakeData))
    })
  })

  it('getSecurityTools calls api.get with correct endpoint and params and returns data', async () => {
    const fakeData = { tools: ['a'] }
    api.get.mockResolvedValueOnce({ data: fakeData })

    render(
      <SecurityProvider>
        <Consumer />
      </SecurityProvider>
    )

    await act(async () => {
      screen.getByTestId('call-tools').click()
    })

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/security-tools', { params: { d: 4 } })
      expect(screen.getByTestId('tools-result').textContent).toBe(JSON.stringify(fakeData))
    })
  })

  it('useSecurityContext throws error when used outside provider', () => {
    const Bad = () => {
      // trying to use hook outside provider should throw
      expect(() => useSecurityContext()).toThrow('useSecurityContext must be used within a SecurityProvider')
      return null
    }

    render(<Bad />)
  })
})
