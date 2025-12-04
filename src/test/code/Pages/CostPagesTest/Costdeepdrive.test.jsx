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

  it('shows Loading initially and then renders the nested table with full data', async () => {
    render(<Costdeepdrive />);

    // Loading state shown first
    expect(screen.getByText(/loading.../i)).toBeInTheDocument();

    // Wait for nested table to appear
    await waitFor(() => expect(screen.getByTestId('nested-table')).toBeInTheDocument());

    // The mocked table renders the count of all results (3)
    expect(screen.getByTestId('nested-table')).toHaveTextContent('Count: 3');
    // Initially Selected should be null
    expect(screen.getByTestId('nested-table')).toHaveTextContent('Selected: null');
  });

  it('filters displayed data when selecting an account and resets on Reset click', async () => {
    render(<Costdeepdrive />);

    // wait for data load
    await waitFor(() => expect(screen.getByTestId('nested-table')).toBeInTheDocument());

    // Open the antd Select (it has role combobox)
    const combobox = screen.getByRole('combobox');
    // open dropdown
    fireEvent.mouseDown(combobox);

    // Try a different approach - find the select element and trigger its onChange directly
    await waitFor(() => {
      // Find the ant-select container and simulate selection
      const selectContainer = combobox.closest('.ant-select');
      if (selectContainer) {
        // Try clicking the visible option in the virtual list
        const visibleOption = document.querySelector('.ant-select-item-option-active');
        if (visibleOption) {
          fireEvent.click(visibleOption);
        } else {
          // Fallback: try to find and click the first option
          const firstOption = document.querySelector('.ant-select-item-option');
          if (firstOption) {
            fireEvent.click(firstOption);
          }
        }
      }
    });

    // After selecting ACC1, nested table should show Selected: ACC1 and Count: 2
    await waitFor(() =>
      expect(screen.getByTestId('nested-table')).toHaveTextContent('Selected: ACC1')
    );
    expect(screen.getByTestId('nested-table')).toHaveTextContent('Count: 2');

    // Click Reset button
    const resetBtn = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetBtn);

    // After reset, selectedAccount should be null and full data should be shown again
    await waitFor(() =>
      expect(screen.getByTestId('nested-table')).toHaveTextContent('Selected: null')
    );
    expect(screen.getByTestId('nested-table')).toHaveTextContent('Count: 3');
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
});
