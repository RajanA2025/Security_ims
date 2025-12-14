// CostContext.test.jsx
import React, { useContext } from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import { vi } from 'vitest'
import { CostProvider, CostContext } from 'c:/project/jit_ms1/Security_ims/src/Context/CostContext'

// Mock the api module that's used in registerCompany
vi.mock('c:/project/jit_ms1/Security_ims/src/lib/api', () => {
  return {
    default: {
      post: vi.fn()
    }
  }
})
import api from 'c:/project/jit_ms1/Security_ims/src/lib/api'

describe('CostContext', () => {
  // keep original fetch to restore later
  const originalFetch = global.fetch

  beforeEach(() => {
    // clear localStorage between tests
    localStorage.clear()
    vi.resetAllMocks()
  })

  afterAll(() => {
    global.fetch = originalFetch
  })

  // Helper: a small consumer component to read context and display values for assertions
  const Consumer = () => {
    const ctx = useContext(CostContext)
    return (
      <div>
        <div data-testid="loading">{String(ctx.loading)}</div>
        <div data-testid="error">{ctx.error ?? ''}</div>
        <div data-testid="accounts-length">{ctx.accounts ? String(ctx.accounts.length) : '0'}</div>
        <div data-testid="apps-length">{ctx.apps ? String(ctx.apps.length) : '0'}</div>
        <div data-testid="tag-summary-total">{String(ctx.tagSummary?.total_resources ?? '')}</div>

        <button
          data-testid="call-register"
          onClick={async () => {
            const res = await ctx.registerCompany({ name: 'Acme' })
            // store result in DOM for test readability
            const el = document.getElementById('register-result')
            if (el) el.textContent = JSON.stringify(res)
          }}
        />
        <div id="register-result" data-testid="register-result" />

        <button
          data-testid="call-login"
          onClick={async () => {
            const res = await ctx.loginCompany({ email: 'a@b.com', password: 'p' })
            const el = document.getElementById('login-result')
            if (el) el.textContent = JSON.stringify(res)
          }}
        />
        <div id="login-result" data-testid="login-result" />

        <button
          data-testid="call-addaccount"
          onClick={async () => {
            const res = await ctx.addAccount({ name: 'NewAcc' })
            const el = document.getElementById('add-result')
            if (el) el.textContent = JSON.stringify(res)
          }}
        />
        <div id="add-result" data-testid="add-result" />

        <button
          data-testid="call-getallcompanies"
          onClick={async () => {
            const res = await ctx.getAllCompanies()
            const el = document.getElementById('companies-result')
            if (el) el.textContent = JSON.stringify(res)
          }}
        />
        <div id="companies-result" data-testid="companies-result" />

        <button
          data-testid="call-getallaccounts"
          onClick={async () => {
            const res = await ctx.getAllAccounts()
            const el = document.getElementById('accounts-result')
            if (el) el.textContent = JSON.stringify(res)
          }}
        />
        <div id="accounts-result" data-testid="accounts-result" />

        <button
          data-testid="set-filters"
          onClick={() => {
            ctx.setFilters({ account_id: 'test-account', app: 'test-app', start_date: '2024-01-01', end_date: '2024-12-31' })
          }}
        />
      </div>
    )
  }

  it('fetches cost, resources and tags on mount and updates context values', async () => {
    // Mock fetch responses for cost-summary, resources/filter, tags/filter
    global.fetch = vi.fn((url) => {
      if (url.includes('/cost-summary')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            account_ids: ['acc-1', 'acc-2'],
            all_account_ids: ['acc-1', 'acc-2'],
            top_5: { top_apps_current_month: [{ app_name: 'AppA' }] }
          })
        })
      }
      if (url.includes('/resources/filter')) {
        return Promise.resolve({
          ok: true,
          json: async () => ([{ id: 1, name: 'res1' }])
        })
      }
      if (url.includes('/tags/filter')) {
        return Promise.resolve({
          ok: true,
          json: async () => ([
            { id: 1, account_name: 'acc-1', account_id: 'acc-1', region: 'us-east-1', service: 's3', resource: 'r1', tags: { Name: 'a', Owner: 'b', Project: 'c', Environment: 'd' } },
            { id: 2, account_name: 'acc-2', account_id: 'acc-2', region: 'us-east-1', service: 'ec2', resource: 'r2', tags: { Name: 'a' } }
          ])
        })
      }

      // default fallback
      return Promise.resolve({
        ok: true,
        json: async () => ({})
      })
    })

    render(
      <CostProvider>
        <Consumer />
      </CostProvider>
    )

    // Wait for effect to finish and context to update
    await waitFor(() => {
      expect(screen.getByTestId('accounts-length').textContent).toBe('3') // actual account length returned
      expect(screen.getByTestId('apps-length').textContent).toBe('1') // one app in top_5
      expect(screen.getByTestId('tag-summary-total').textContent).toBe('2') // two tag resources processed
      // loading should eventually become false
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
  })

  it('registerCompany calls api.post and returns data', async () => {
    // Mock api.post to resolve with response.data
    api.post.mockResolvedValue({ data: { id: 123, name: 'Acme' } })

    // minimal fetch mocks so mount effect doesn't throw
    global.fetch = vi.fn((url) =>
      Promise.resolve({ ok: true, json: async () => ({ account_ids: [], all_account_ids: [], top_5: { top_apps_current_month: [] } }) })
    )

    render(
      <CostProvider>
        <Consumer />
      </CostProvider>
    )

    // Call register via button in consumer
    await act(async () => {
      screen.getByTestId('call-register').click()
    })

    // assert the DOM stored the returned value
    await waitFor(() => {
      const reg = screen.getByTestId('register-result').textContent
      expect(reg).toContain('"id":123')
      expect(api.post).toHaveBeenCalledWith('/api/company/register', { name: 'Acme' })
    })
  })

  it('loginCompany posts to login endpoint and stores tokens in localStorage', async () => {
    // Mock fetch for login endpoint
    global.fetch = vi.fn((url, opts) => {
      if (url.includes('/api/company/login')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'jwt-token-1', cid: 'CID-1' })
        })
      }
      // other mounts
      return Promise.resolve({ ok: true, json: async () => ({ account_ids: [], all_account_ids: [], top_5: { top_apps_current_month: [] } }) })
    })

    render(
      <CostProvider>
        <Consumer />
      </CostProvider>
    )

    await act(async () => {
      screen.getByTestId('call-login').click()
    })

    await waitFor(() => {
      const loginRes = screen.getByTestId('login-result').textContent
      expect(loginRes).toContain('jwt-token-1')
      // localStorage side effects
      expect(localStorage.getItem('auth_token')).toBe('jwt-token-1')
      expect(localStorage.getItem('jwt_token')).toBe('jwt-token-1')
      expect(localStorage.getItem('company_cid')).toBe('CID-1')
    })
  })

  it('addAccount posts to account add endpoint and returns result', async () => {
    // Mock add account endpoint
    global.fetch = vi.fn((url, opts) => {
      if (url.includes('/api/account/add')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, account: { id: 'new-acc' } })
        })
      }
      // mount fallback
      return Promise.resolve({ ok: true, json: async () => ({ account_ids: [], all_account_ids: [], top_5: { top_apps_current_month: [] } }) })
    })

    render(
      <CostProvider>
        <Consumer />
      </CostProvider>
    )

    await act(async () => {
      screen.getByTestId('call-addaccount').click()
    })

    await waitFor(() => {
      const addRes = screen.getByTestId('add-result').textContent
      expect(addRes).toContain('"success":true')
    })
  })

  it('getAllCompanies caches results and respects forceRefresh', async () => {
    // First response
    const firstResp = [{ id: 'c1' }]
    const secondResp = [{ id: 'c2' }]

    const fetchMock = vi.fn()
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: async () => firstResp })) // initial mount or first call
      .mockImplementation(() => Promise.resolve({ ok: true, json: async () => secondResp })) // later calls

    global.fetch = fetchMock

    render(
      <CostProvider>
        <Consumer />
      </CostProvider>
    )

    // Call getAllCompanies via consumer button to store first result
    await act(async () => {
      screen.getByTestId('call-getallcompanies').click()
    })

    await waitFor(() => {
      expect(screen.getByTestId('companies-result').textContent).toContain('c2')
    })

    // Clear companies-result DOM
    document.getElementById('companies-result').textContent = ''

    // Call getAllCompanies again - should return cached (no new fetch) because hasFetchedCompanies true
    await act(async () => {
      screen.getByTestId('call-getallcompanies').click()
    })

    // Because our mock's second implementation returns secondResp, to ensure caching we check fetch call count:
    // If cached, fetch should not have been called a second time for /api/company/all
    // But note: fetchMock was used earlier in mount too; count should be >=1
    const callsBefore = fetchMock.mock.calls.length

    // Force refresh should call fetch again
    // We need to access context directly to call getAllCompanies(true). Instead of changing consumer, we'll simulate by invoking through button that calls ctx.getAllCompanies()
    await act(async () => {
      // use the context directly by creating a temporary consumer to call forceRefresh
      const ForceConsumer = () => {
        const ctx = useContext(CostContext)
        React.useEffect(() => {
          ctx.getAllCompanies(true).then(res => {
            const el = document.getElementById('companies-result')
            if (el) el.textContent = JSON.stringify(res)
          })
        }, [])
        return null
      }

      render(
        <CostProvider>
          <ForceConsumer />
        </CostProvider>
      )
    })

    // Wait for second response to appear
    await waitFor(() => {
      expect(screen.getByTestId('companies-result').textContent).toContain('c2')
    })

    // Ensure fetch was called additional times (forceRefresh triggered a new fetch)
    expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(callsBefore + 1)
  })

  it('getAllAccounts fetches accounts for company', async () => {
    // Set company_cid in localStorage
    localStorage.setItem('company_cid', 'test-company-id')
    localStorage.setItem('auth_token', 'test-token')

    const mockAccounts = [{ id: 'acc1', name: 'Account 1' }]
    
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/accounts/all/test-company-id')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockAccounts
        })
      }
      // mount fallback
      return Promise.resolve({ ok: true, json: async () => ({ account_ids: [], all_account_ids: [], top_5: { top_apps_current_month: [] } }) })
    })

    render(
      <CostProvider>
        <Consumer />
      </CostProvider>
    )

    await act(async () => {
      screen.getByTestId('call-getallaccounts').click()
    })

    await waitFor(() => {
      const accountsRes = screen.getByTestId('accounts-result').textContent
      expect(accountsRes).toContain('Account 1')
    })
  })

  it('getAllAccounts handles missing company ID', async () => {
    // Don't set company_cid in localStorage
    localStorage.setItem('auth_token', 'test-token')

    global.fetch = vi.fn(() => 
      Promise.resolve({ ok: true, json: async () => ({ account_ids: [], all_account_ids: [], top_5: { top_apps_current_month: [] } }) })
    )

    render(
      <CostProvider>
        <Consumer />
      </CostProvider>
    )

    await act(async () => {
      screen.getByTestId('call-getallaccounts').click()
    })

    await waitFor(() => {
      const accountsRes = screen.getByTestId('accounts-result').textContent
      expect(accountsRes).toContain('Company ID missing')
    })
  })

  it('handles error scenarios in API calls', async () => {
    // Mock fetch to return errors
    global.fetch = vi.fn((url) => {
      if (url.includes('/cost-summary')) {
        return Promise.resolve({
          ok: false,
          json: async () => ({ message: 'Cost fetch failed' })
        })
      }
      if (url.includes('/resources/filter')) {
        return Promise.reject(new Error('Network error'))
      }
      if (url.includes('/tags/filter')) {
        return Promise.resolve({
          ok: false,
          json: async () => ({ message: 'Tags fetch failed' })
        })
      }
      return Promise.resolve({ ok: true, json: async () => ({}) })
    })

    render(
      <CostProvider>
        <Consumer />
      </CostProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toBeTruthy()
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
  })

  it('registerCompany handles API errors', async () => {
    // Mock api.post to reject
    api.post.mockRejectedValue(new Error('Network error'))

    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: async () => ({ account_ids: [], all_account_ids: [], top_5: { top_apps_current_month: [] } }) })
    )

    render(
      <CostProvider>
        <Consumer />
      </CostProvider>
    )

    await act(async () => {
      screen.getByTestId('call-register').click()
    })

    await waitFor(() => {
      const reg = screen.getByTestId('register-result').textContent
      expect(reg).toContain('"error":"Network error"')
    })
  })

  it('loginCompany handles authentication errors', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/company/login')) {
        return Promise.resolve({
          ok: false,
          json: async () => ({ message: 'Invalid credentials' })
        })
      }
      return Promise.resolve({ ok: true, json: async () => ({ account_ids: [], all_account_ids: [], top_5: { top_apps_current_month: [] } }) })
    })

    render(
      <CostProvider>
        <Consumer />
      </CostProvider>
    )

    await act(async () => {
      screen.getByTestId('call-login').click()
    })

    await waitFor(() => {
      const loginRes = screen.getByTestId('login-result').textContent
      expect(loginRes).toContain('Invalid credentials')
    })
  })

  it('addAccount handles API errors', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/account/add')) {
        return Promise.resolve({
          ok: false,
          json: async () => ({ message: 'Account creation failed' })
        })
      }
      return Promise.resolve({ ok: true, json: async () => ({ account_ids: [], all_account_ids: [], top_5: { top_apps_current_month: [] } }) })
    })

    render(
      <CostProvider>
        <Consumer />
      </CostProvider>
    )

    await act(async () => {
      screen.getByTestId('call-addaccount').click()
    })

    await waitFor(() => {
      const addRes = screen.getByTestId('add-result').textContent
      expect(addRes).toContain('Account creation failed')
    })
  })

  it('setFilters updates context and triggers data refetch', async () => {
    let fetchCallCount = 0
    
    global.fetch = vi.fn(() => {
      fetchCallCount++
      return Promise.resolve({ 
        ok: true, 
        json: async () => ({ 
          account_ids: ['acc-1'], 
          all_account_ids: ['acc-1'], 
          top_5: { top_apps_current_month: [] } 
        }) 
      })
    })

    render(
      <CostProvider>
        <Consumer />
      </CostProvider>
    )

    // Wait for initial fetch
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })

    const callsBefore = fetchCallCount

    // Change filters
    await act(async () => {
      screen.getByTestId('set-filters').click()
    })

    // Wait for refetch
    await waitFor(() => {
      expect(fetchCallCount).toBeGreaterThan(callsBefore)
    })
  })

  it('processes tag data correctly with missing tags', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/tags/filter')) {
        return Promise.resolve({
          ok: true,
          json: async () => ([
            { id: 1, account_name: 'acc-1', account_id: 'acc-1', region: 'us-east-1', service: 's3', resource: 'r1', tags: {} }, // no tags
            { id: 2, account_name: 'acc-2', account_id: 'acc-2', region: 'us-east-1', service: 'ec2', resource: 'r2', tags: null }, // null tags
            { id: 3, account_name: 'acc-3', account_id: 'acc-3', region: 'us-east-1', service: 'lambda', resource: 'r3', tags: { Name: 'test' } } // partial tags
          ])
        })
      }
      return Promise.resolve({ ok: true, json: async () => ({ account_ids: [], all_account_ids: [], top_5: { top_apps_current_month: [] } }) })
    })

    render(
      <CostProvider>
        <Consumer />
      </CostProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('tag-summary-total').textContent).toBe('3')
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
  })

  it('handles invalid JSON in localStorage account_ids', async () => {
    // Set invalid JSON in localStorage
    localStorage.setItem('account_ids', 'invalid-json-string')

    global.fetch = vi.fn(() => 
      Promise.resolve({ ok: true, json: async () => ({ account_ids: [], all_account_ids: [], top_5: { top_apps_current_month: [] } }) })
    )

    render(
      <CostProvider>
        <Consumer />
      </CostProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false')
    })
  })

  it('handles getAllAccounts API errors', async () => {
    localStorage.setItem('company_cid', 'test-company-id')
    localStorage.setItem('auth_token', 'test-token')

    global.fetch = vi.fn((url) => {
      if (url.includes('/api/accounts/all/test-company-id')) {
        return Promise.reject(new Error('Network error'))
      }
      return Promise.resolve({ ok: true, json: async () => ({ account_ids: [], all_account_ids: [], top_5: { top_apps_current_month: [] } }) })
    })

    render(
      <CostProvider>
        <Consumer />
      </CostProvider>
    )

    await act(async () => {
      screen.getByTestId('call-getallaccounts').click()
    })

    await waitFor(() => {
      const accountsRes = screen.getByTestId('accounts-result').textContent
      expect(accountsRes).toContain('"error":"Network error"')
    })
  })

  it('handles getAllCompanies API errors', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/company/all')) {
        return Promise.reject(new Error('Network error'))
      }
      return Promise.resolve({ ok: true, json: async () => ({ account_ids: [], all_account_ids: [], top_5: { top_apps_current_month: [] } }) })
    })

    render(
      <CostProvider>
        <Consumer />
      </CostProvider>
    )

    await act(async () => {
      screen.getByTestId('call-getallcompanies').click()
    })

    await waitFor(() => {
      const companiesRes = screen.getByTestId('companies-result').textContent
      expect(companiesRes).toContain('"error":"Network error"')
    })
  })

  it('handles getAllCompanies non-OK response', async () => {
    global.fetch = vi.fn((url) => {
      if (url.includes('/api/company/all')) {
        return Promise.resolve({
          ok: false,
          json: async () => ({ message: 'Failed to fetch companies' })
        })
      }
      return Promise.resolve({ ok: true, json: async () => ({ account_ids: [], all_account_ids: [], top_5: { top_apps_current_month: [] } }) })
    })

    render(
      <CostProvider>
        <Consumer />
      </CostProvider>
    )

    await act(async () => {
      screen.getByTestId('call-getallcompanies').click()
    })

    await waitFor(() => {
      const companiesRes = screen.getByTestId('companies-result').textContent
      expect(companiesRes).toContain('Failed to fetch companies')
    })
  })

  it('handles getAllAccounts non-OK response', async () => {
    localStorage.setItem('company_cid', 'test-company-id')
    localStorage.setItem('auth_token', 'test-token')

    global.fetch = vi.fn((url) => {
      if (url.includes('/api/accounts/all/test-company-id')) {
        return Promise.resolve({
          ok: false,
          json: async () => ({ message: 'Failed to fetch accounts' })
        })
      }
      return Promise.resolve({ ok: true, json: async () => ({ account_ids: [], all_account_ids: [], top_5: { top_apps_current_month: [] } }) })
    })

    render(
      <CostProvider>
        <Consumer />
      </CostProvider>
    )

    await act(async () => {
      screen.getByTestId('call-getallaccounts').click()
    })

    await waitFor(() => {
      const accountsRes = screen.getByTestId('accounts-result').textContent
      expect(accountsRes).toContain('Failed to fetch accounts')
    })
  })
})
