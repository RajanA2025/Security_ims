// src/test/Savings.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => '[]'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock window.matchMedia for Ant Design
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver for chart components
global.ResizeObserver = class ResizeObserver {
  constructor() {
    this.observe = vi.fn();
    this.unobserve = vi.fn();
    this.disconnect = vi.fn();
  }
};

// Mock CostContext before component imports
vi.mock('../../Context/CostContext', () => ({
  CostContext: React.createContext({
    resourcesData: {
      underutilized_ec2: [],
      underutilized_ebs: [],
      orphaned_volumes: [],
      orphaned_eips: [],
      orphaned_snapshots: []
    },
    loading: false,
    error: null,
    filters: {},
    setFilters: vi.fn(),
    accounts: [],
    costData: null
  })
}));

// Mock all dependencies of Savingdashmain
vi.mock('../../components/CostComponents/LogAxisChart', () => ({
  default: () => <div data-testid="log-axis-chart">LogAxisChart</div>
}));

vi.mock('../../components/CostComponents/SavingsTrendGraph', () => ({
  default: () => <div data-testid="savings-trend-graph">SavingsTrendGraph</div>
}));

// Mock child components
vi.mock('../../components/CostComponents/Savingchild', () => ({
  default: () => <div data-testid="saving-child">Saving Child</div>,
}));
vi.mock('../../components/CostComponents/Savingdashmain', () => ({
  Savingdashmain: () => <div data-testid="saving-dash-main">Saving Dash Main</div>,
}));

// Import after mocks
import { Savings } from '@/pages/CostPages/Savings';
import { CostContext } from '@/context/CostContext';

describe('Savings component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Savings components', () => {
    const mockContext = {
      resourcesData: {
        underutilized_ec2: [],
        underutilized_ebs: [],
        orphaned_volumes: [],
        orphaned_eips: [],
        orphaned_snapshots: []
      },
      loading: false,
      error: null,
      filters: {},
      setFilters: vi.fn(),
      accounts: [],
      costData: null
    };

    render(
      <CostContext.Provider value={mockContext}>
        <Savings />
      </CostContext.Provider>
    );

    // Check for actual content that's rendered by the components
    expect(screen.getByText('Potential Savings')).toBeInTheDocument();
    expect(screen.getByText('Realized Savings')).toBeInTheDocument();
    
    // Check that monetary values are rendered (showing $0 for empty data)
    expect(screen.getAllByText('$0')).toHaveLength(5);
  });
});
