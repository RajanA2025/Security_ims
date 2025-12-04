// SavingsChild.test.jsx
import React from 'react'
import { render, screen, waitFor, act, fireEvent, cleanup } from '@testing-library/react'
import { vi } from 'vitest'
import SavingsChild from "c:/project/jit_ms1/Security_ims/src/components/CostComponents/Savingchild.jsx"
import axios from 'axios'

// Mock axios
vi.mock('axios')
const mockedAxios = vi.mocked(axios)

// Mock window.matchMedia for Antd's responsive hooks
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
})

// Mock antd-style createStyles to avoid CSS runtime issues
vi.mock('antd-style', () => {
  return {
    createStyles: () => () => ({
      styles: {
        customTable: 'custom-table-class'
      }
    })
  }
})

// Provide safe getBoundingClientRect if any layout code relies on it
Element.prototype.getBoundingClientRect = Element.prototype.getBoundingClientRect || function () {
  return { top: 0, left: 0, right: 0, bottom: 0, width: 100, height: 20 }
}

afterEach(() => {
  vi.clearAllMocks()
  cleanup()
  localStorage.clear()
})

describe('SavingsChild', () => {
  it('renders summary cards with counts and total costs from API', async () => {
    // prepare localStorage so filterByAccounts will not exclude our test data
    localStorage.setItem('account_ids', JSON.stringify(['acc-1', 'acc-2']))

    // Prepare fake API response
    const fakeResponse = {
      orphaned_volumes: [
        { account_id: 'acc-1', region: 'us-east-1', volume_id: 'vol-1', volume_name: 'disk-1', volume_type: 'gp2', volume_size: 10, cost_savings: 5, recommendations: { suggestion: 'delete' }, status: 'active' }
      ],
      orphaned_eips: [
        { account_id: 'acc-2', region: 'us-west-2', public_ip: '1.2.3.4', allocation_id: 'eip-1', cost: 2, status: 'active' }
      ],
      orphaned_snapshots: [
        { account_id: 'acc-1', region: 'us-east-1', snapshot_id: 'snap-1', snapshot_name: 'snapA', size: 20, cost_savings: 3, status: 'active' }
      ],
      underutilized_ec2: [
        { account_id: 'acc-1', region: 'us-east-1', instance_id: 'i-1', instance_name: 'web', instance_type: 't3.small', cost_savings: 12, recommendations: { suggestion: 'resize', reason: 'low cpu' }, status: 'open' }
      ],
      underutilized_ebs: []
    }

    mockedAxios.post.mockResolvedValueOnce({ data: fakeResponse })

    await act(async () => {
      render(<SavingsChild />)
    })

    // Wait for effect and UI updates
    await waitFor(() => {
      // Summary card headings present - use getAllByText to handle multiple matches
      expect(screen.getAllByText(/Orphaned Disks/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Orphaned Elastic IPs/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Orphaned Snapshots/i).length).toBeGreaterThan(0)
      // For Rightsizing, use the tab specifically
      expect(screen.getByRole('tab', { name: /Rightsizing/i })).toBeInTheDocument()
    })

    // Check tags (counts) - Tag shows length numbers
    // We expect orphaned_volumes length = 1 etc.
    expect(screen.getAllByText('1').length).toBeGreaterThan(0) // at least one "1" appears (disk count)
    // Check total cost calculations shown on cards (format "$X.XX")
    // Orphaned Disks total cost: cost_savings = 5 -> displays 5.00
    expect(screen.getByText(/Total Cost: \$5\.00/)).toBeInTheDocument()
    // Orphaned Elastic IP total cost: 2.00
    expect(screen.getByText(/Total Cost: \$2\.00/)).toBeInTheDocument()
    // Orphaned Snapshots total cost: 3.00
    expect(screen.getByText(/Total Cost: \$3\.00/)).toBeInTheDocument()
  })

  it('renders combined table rows when switching to "Orphaned" tab and filtering', async () => {
    localStorage.setItem('account_ids', JSON.stringify(['acc-1']))
    const fakeResponse = {
      orphaned_volumes: [
        { account_id: 'acc-1', region: 'us-east-1', volume_id: 'vol-1', volume_name: 'disk-1', volume_type: 'gp2', volume_size: 10, cost_savings: 5, recommendations: { suggestion: 'delete' }, status: 'Assigned' }
      ],
      orphaned_eips: [],
      orphaned_snapshots: [],
      underutilized_ec2: [],
      underutilized_ebs: []
    }
    mockedAxios.post.mockResolvedValueOnce({ data: fakeResponse })

    await act(async () => {
      render(<SavingsChild />)
    })

    // Switch to Orphaned tab by clicking its label
    const orphanedTab = screen.getByRole('tab', { name: /Orphaned/i })
    await act(async () => {
      fireEvent.click(orphanedTab)
    })

    // Wait for table to render rows
    await waitFor(() => {
      // It should show resourceType "Disk" in a Tag (rendered in table)
      // Use getAllByText to handle multiple matches
      expect(screen.getAllByText(/Disk/i).length).toBeGreaterThan(0)
      // It should show the volume id
      expect(screen.getByText(/vol-1/i)).toBeInTheDocument()
      // Cost column should show $5.00
      expect(screen.getByText(/\$5\.00/)).toBeInTheDocument()
    })
  })

  it('shows rightsizing table and switches columns when changing rightsizing filter', async () => {
    localStorage.setItem('account_ids', JSON.stringify(['acc-1']))
    const fakeResponse = {
      orphaned_volumes: [],
      orphaned_eips: [],
      orphaned_snapshots: [],
      underutilized_ec2: [
        { account_id: 'acc-1', region: 'us-east-1', instance_id: 'i-1', instance_name: 'web', instance_type: 't3.small', cost_savings: 12, recommendations: { suggestion: 'resize' }, status: 'Unassigned' }
      ],
      underutilized_ebs: [
        { account_id: 'acc-1', region: 'us-east-1', volume_id: 'vol-2', volume_name: 'ebs-1', volume_type: 'gp2', volume_size: 50, cost_savings: 8, recommendations: { suggestion: 'snapshot' }, status: 'Unassigned' }
      ]
    }
    mockedAxios.post.mockResolvedValueOnce({ data: fakeResponse })

    await act(async () => {
      render(<SavingsChild />)
    })

    // Go to Rightsizing tab
    const rightsizingTab = screen.getByRole('tab', { name: /Rightsizing/i })
    await act(async () => {
      fireEvent.click(rightsizingTab)
    })

    // Wait for rightsizing Select to appear
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    // Initially the default value is underutilized_ec2; table should show "Instance ID" column header
    // Use getAllByText to handle multiple matches (there might be a hidden header)
    expect(screen.getAllByText(/Instance ID/i).length).toBeGreaterThan(0)
    // Now change the select to underutilized_ebs
    const select = screen.getByRole('combobox')
    // Fire change event: simulate selecting EBS option
    await act(async () => {
      fireEvent.mouseDown(select) // opens (some antd internals) - but simpler: change value via input
    })
    // Simulate selecting by finding the option by text and clicking it
    const ebsOption = screen.getByText(/Underutilized EBS/i)
    await act(async () => {
      fireEvent.click(ebsOption)
    })

    // After change, table should show "Volume ID" header
    await waitFor(() => {
      expect(screen.getAllByText(/Volume ID/i).length).toBeGreaterThan(0)
    })
  })

  it('handles empty API response gracefully (no rows)', async () => {
    localStorage.setItem('account_ids', JSON.stringify(['acc-1']))
    mockedAxios.post.mockResolvedValueOnce({ data: { orphaned_volumes: [], orphaned_eips: [], orphaned_snapshots: [], underutilized_ec2: [], underutilized_ebs: [] } })

    await act(async () => {
      render(<SavingsChild />)
    })

    // Summary counts should be zero; Rightsizing tag should show 0
    await waitFor(() => {
      // Rightsizing tag text includes 0 somewhere; check that at least one "0" is visible
      expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('handles API error gracefully', async () => {
    localStorage.setItem('account_ids', JSON.stringify(['acc-1']))
    mockedAxios.post.mockRejectedValueOnce(new Error('Network error'))

    await act(async () => {
      render(<SavingsChild />)
    })

    // Component should still render without crashing
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /Orphaned/i })).toBeInTheDocument()
    })
  })

  it('handles missing localStorage account_ids', async () => {
    // Don't set localStorage.account_ids
    mockedAxios.post.mockResolvedValueOnce({ data: { orphaned_volumes: [], orphaned_eips: [], orphaned_snapshots: [], underutilized_ec2: [], underutilized_ebs: [] } })

    await act(async () => {
      render(<SavingsChild />)
    })

    // Component should still render without crashing
    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /Orphaned/i })).toBeInTheDocument()
    })
  })
})
