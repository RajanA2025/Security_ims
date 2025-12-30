// src/test/CompanyAdminUsers.test.jsx
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { vi } from 'vitest';
import CompanyAdminUsers from '@/pages/companyAdmin/homeScreen'; 

describe('CompanyAdminUsers component', () => {
  it('renders header and Create button', () => {
    render(<CompanyAdminUsers />);
    // Header
    expect(screen.getByText(/users/i)).toBeInTheDocument();
    // Create button (should have accessible name "Create")
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
  });

  it('renders all user cards (names) from the mock', () => {
    render(<CompanyAdminUsers />);
    // The component uses <h2> for each user name; assert the 3 names from usersMock are present
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();

    // Count the number of user headings (h2)
    const userHeadings = screen.getAllByRole('heading').filter(h => h.tagName === 'H2');
    // If other headings exist, this filter ensures we count only h2s. Expect 3 user cards.
    expect(userHeadings.length).toBe(3);
  });

  it('shows permission badges for a user', () => {
    render(<CompanyAdminUsers />);
    // Check some permission badges are visible
    expect(screen.getAllByText('Cost').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Performance').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Security').length).toBeGreaterThanOrEqual(1);

    // More specific: Alice should show all three permissions
    const aliceCard = screen.getByText('Alice Johnson').closest('div');
    expect(aliceCard).toBeTruthy();
    if (aliceCard) {
      expect(within(aliceCard).getByText('Cost')).toBeInTheDocument();
      expect(within(aliceCard).getByText('Performance')).toBeInTheDocument();
      expect(within(aliceCard).getByText('Security')).toBeInTheDocument();
    }
  });

  it('calls alert when Create button is clicked', () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<CompanyAdminUsers />);
    const createBtn = screen.getByRole('button', { name: /create/i });
    fireEvent.click(createBtn);
    expect(alertSpy).toHaveBeenCalledWith('Redirect to create user form!');
    alertSpy.mockRestore();
  });
});
