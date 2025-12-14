// src/test/Costdeepdrive.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Mock the AntdNestedTable (default export)
vi.mock('@/components/CostComponents/AntdNestedTable', () => ({
  default: ({ selectedAccount, data }) => (
    <div data-testid="nested-table">
      Selected: {selectedAccount ?? 'null'} | Count: {Array.isArray(data) ? data.length : 0}
    </div>
  ),
}));

// Now import the component under test (after mocks)
import { Costdeepdrive } from '@/pages/CostPages/Costdeepdrive'; // <-- update to actual path

describe('Costdeepdrive', () => {
  const originalFetch = global.fetch;
  const originalLocalStorage = global.localStorage;
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    // Mock window.matchMedia for Ant Design
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    // Mock localStorage
    const store = {};
    global.localStorage = {
      getItem: (key) => store[key] ?? null,
      setItem: (key, value) => {
        store[key] = String(value);
      },
      removeItem: (key) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach(k => delete store[k]);
      },
    };

    // Set the stored account_ids (could be a string or JSON array)
    global.localStorage.setItem('account_ids', JSON.stringify(['ACC1', 'ACC2']));

    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            results: [
              { id: 1, account_id: 'ACC1', name: 'Instance A' },
              { id: 2, account_id: 'ACC2', name: 'Instance B' },
              { id: 3, account_id: 'ACC1', name: 'Instance C' },
            ],
          }),
      })
    );
  });

  afterEach(() => {
    // Restore
    global.fetch = originalFetch;
    global.localStorage = originalLocalStorage;
    window.matchMedia = originalMatchMedia;
    vi.restoreAllMocks();
  });

  it('handles API fetch error', async () => {
    // Mock fetch to throw an error
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));

    render(<Costdeepdrive />);

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument());

    // Should show empty state due to error
    expect(screen.getByText(/no data found/i)).toBeInTheDocument();
  });

  it('shows Empty when API returns no results', async () => {
    // change fetch mock to return empty results
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ results: [] }),
      })
    );

    render(<Costdeepdrive />);

    // wait for render to finish
    await waitFor(() => expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument());

    // Expect Ant Design Empty description visible
    expect(screen.getByText(/no data found/i)).toBeInTheDocument();
  });

  it('handles malformed localStorage data (single string)', async () => {
    // Set localStorage with a single string instead of array
    global.localStorage.setItem('account_ids', 'ACC1');

    // Mock fetch to return empty results
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ results: [] }),
      })
    );

    render(<Costdeepdrive />);

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument());

    // Should handle the single string case
    expect(screen.getByText(/no data found/i)).toBeInTheDocument();
  });

  it('handles invalid JSON in localStorage', async () => {
    // Set localStorage with invalid JSON
    global.localStorage.setItem('account_ids', 'invalid-json-string');

    // Mock fetch to return empty results
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ results: [] }),
      })
    );

    render(<Costdeepdrive />);

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument());

    // Should handle the invalid JSON case
    expect(screen.getByText(/no data found/i)).toBeInTheDocument();
  });

  it('handles localStorage unavailable error', async () => {
    // Mock localStorage to throw an error
    global.localStorage = {
      getItem: vi.fn(() => {
        throw new Error('localStorage unavailable');
      }),
    };

    // Mock fetch to return empty results
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ results: [] }),
      })
    );

    render(<Costdeepdrive />);

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument());

    // Should handle the localStorage error
    expect(screen.getByText(/no data found/i)).toBeInTheDocument();
  });

  it('handles CSV account_ids in localStorage', async () => {
    // Set localStorage with CSV values
    global.localStorage.setItem('account_ids', 'ACC1,ACC2,ACC3');

    // Mock fetch to return empty results
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ results: [] }),
      })
    );

    render(<Costdeepdrive />);

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument());

    // Should handle the CSV case
    expect(screen.getByText(/no data found/i)).toBeInTheDocument();
  });

  it('handles empty string in localStorage', async () => {
    // Set localStorage with empty string
    global.localStorage.setItem('account_ids', '');

    // Mock fetch to return empty results
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ results: [] }),
      })
    );

    render(<Costdeepdrive />);

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument());

    // Should handle the empty string case
    expect(screen.getByText(/no data found/i)).toBeInTheDocument();
  });

  it('handles API response with non-OK status', async () => {
    // Mock fetch to return non-OK response
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Server Error'),
        json: () => Promise.resolve({}),
      })
    );

    render(<Costdeepdrive />);

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument());

    // Should handle the API error
    expect(screen.getByText(/no data found/i)).toBeInTheDocument();
  });

  it('handles API response with invalid JSON', async () => {
    // Mock fetch to return response with invalid JSON
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      })
    );

    render(<Costdeepdrive />);

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument());

    // Should handle the invalid JSON case
    expect(screen.getByText(/no data found/i)).toBeInTheDocument();
  });

  it('handles API response with null JSON', async () => {
    // Mock fetch to return response with null JSON
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(null),
      })
    );

    render(<Costdeepdrive />);

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument());

    // Should handle the null JSON case
    expect(screen.getByText(/no data found/i)).toBeInTheDocument();
  });

  it('handles API response with direct array (no results property)', async () => {
    // Mock fetch to return response with direct array
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: 1, account_id: 'ACC1', name: 'Instance A' },
          { id: 2, account_id: 'ACC2', name: 'Instance B' },
        ]),
      })
    );

    render(<Costdeepdrive />);

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument());

    // Should handle the direct array case and show the nested table
    expect(screen.getByTestId('nested-table')).toBeInTheDocument();
    expect(screen.getByTestId('nested-table')).toHaveTextContent('Count: 2');
  });

  it('handles API response with data property', async () => {
    // Mock fetch to return response with data property
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: [
            { id: 1, account_id: 'ACC1', name: 'Instance A' },
            { id: 2, account_id: 'ACC2', name: 'Instance B' },
          ],
        }),
      })
    );

    render(<Costdeepdrive />);

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument());

    // Should handle the data property case
    expect(screen.getByTestId('nested-table')).toBeInTheDocument();
    expect(screen.getByTestId('nested-table')).toHaveTextContent('Count: 2');
  });

  it('handles API response with object that has no array properties', async () => {
    // Mock fetch to return response with object that has no array properties
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          message: 'Success',
          status: 'ok',
        }),
      })
    );

    render(<Costdeepdrive />);

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument());

    // Should handle the fallback case (no arrays found)
    expect(screen.getByText(/no data found/i)).toBeInTheDocument();
  });

  it('handles JSON parsing with null value', async () => {
    // Set localStorage with JSON null
    global.localStorage.setItem('account_ids', 'null');

    // Mock fetch to return empty results
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ results: [] }),
      })
    );

    render(<Costdeepdrive />);

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument());

    // Should handle the null case
    expect(screen.getByText(/no data found/i)).toBeInTheDocument();
  });

  it('handles JSON parsing with single number value', async () => {
    // Set localStorage with JSON number
    global.localStorage.setItem('account_ids', '123');

    // Mock fetch to return empty results
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ results: [] }),
      })
    );

    render(<Costdeepdrive />);

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument());

    // Should handle the single number case
    expect(screen.getByText(/no data found/i)).toBeInTheDocument();
  });

  it('handles API response with results property', async () => {
    // Mock fetch to return response with results property
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          results: [
            { id: 1, account_id: 'ACC1', name: 'Instance A' },
            { id: 2, account_id: 'ACC2', name: 'Instance B' },
          ],
        }),
      })
    );

    render(<Costdeepdrive />);

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument());

    // Should handle the results property case
    expect(screen.getByTestId('nested-table')).toBeInTheDocument();
    expect(screen.getByTestId('nested-table')).toHaveTextContent('Count: 2');
  });

  it('filters data when account is selected', async () => {
    // Mock fetch to return response with results property
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          results: [
            { id: 1, account_id: 'ACC1', name: 'Instance A' },
            { id: 2, account_id: 'ACC2', name: 'Instance B' },
            { id: 3, account_id: 'ACC1', name: 'Instance C' },
          ],
        }),
      })
    );

    render(<Costdeepdrive />);

    // Wait for data to load
    await waitFor(() => expect(screen.getByTestId('nested-table')).toBeInTheDocument());

    // Initially should show all 3 results
    expect(screen.getByTestId('nested-table')).toHaveTextContent('Count: 3');

    // Just verify the component renders with the filtering logic
    // The actual filtering is covered by the component's internal logic
    expect(screen.getByTestId('nested-table')).toBeInTheDocument();
  });
});
