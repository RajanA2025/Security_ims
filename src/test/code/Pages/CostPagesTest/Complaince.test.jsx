// src/test/Complaince.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

// Mock the entire module paths correctly
vi.mock('@/components/CostComponents/Complaincedashmain', () => ({
  Complaincedashmain: () => <div data-testid="dash-main">Dashboard Main</div>,
}));

vi.mock('@/components/CostComponents/Complaincechild', () => ({
  default: () => <div data-testid="child-component">Child Component</div>,
}));

// Component to test
import { Complaince } from '@/pages/CostPages/Complaince';

describe('Complaince Component', () => {
  it('renders both Complaincedashmain and Complaincechild', () => {
    render(<Complaince />);

    expect(screen.getByTestId('dash-main')).toBeInTheDocument();
    expect(screen.getByTestId('child-component')).toBeInTheDocument();
  });
});
