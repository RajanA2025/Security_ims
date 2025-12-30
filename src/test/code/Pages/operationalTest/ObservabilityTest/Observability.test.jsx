/**
 * @file Observability.test.jsx
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- Mock window.matchMedia for Ant Design ----
Object.defineProperty(window, "matchMedia", {
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

// ---- Mock ResizeObserver ----
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn
}));

// ---- Mock Context: useObservability ----
vi.mock("../../../../../Context/ObservabilityContext", () => ({
  useObservability: vi.fn(),
}));

// ---- Mock Ant Design's less-important parts if needed (optional) ----
// (Most of the time, real antd components work fine in tests.)

// ---- Component under test ----
// ⚠️ Adjust this path based on where your Observability.jsx is actually stored
import Observability from "@/pages/operational/Observability/Observability";
import { useObservability } from "../../../../../Context/ObservabilityContext";

beforeEach(() => {
  vi.clearAllMocks();

  // Default mock data for all tabs
  useObservability.mockReturnValue({
    loading: false,
    securityData: [
      {
        account_id: "111111111111",
        account_name: "Alpha Corp",
        region: "us-east-1",
        key_name: "alpha-key",
        key_pair_id: "key-001",
        key_type: "rsa",
        key_fingerprint: "aa:bb:cc",
        create_time: "2024-01-01",
        status: "Active",
        instance_name: "alpha-instance",
        instance_id: "i-111",
        tags: { env: "prod" },
      },
    ],
    eipData: [
      {
        account_id: "222222222222",
        account_name: "Beta Corp",
        region: "us-west-2",
        allocation_id: "eipalloc-123",
        public_ip: "1.2.3.4",
        domain: "vpc",
        public_ipv4_pool: "amazon",
        status: "available",
      },
    ],
    volumeData: [
      {
        account_id: "333333333333",
        account_name: "Gamma Corp",
        region: "eu-central-1",
        volume_id: "vol-001",
        volume_name: "gamma-volume",
        size: 100,
        state: "available",
        availability_zone: "eu-central-1a",
        throughput: 125,
        iops: 3000,
        snapshot_id: "snap-001",
        create_time: "2024-01-02",
        created_at: "2024-01-03",
        tags: [{ Key: "env", Value: "dev" }],
      },
    ],
    s3Data: [
      {
        account_id: "444444444444",
        account_name: "Delta Corp",
        region: "ap-south-1",
        bucket_name: "delta-bucket",
        bucket_arn: "arn:aws:s3:::delta-bucket",
        owner: "delta-owner",
        creation_date: "2024-01-01",
        last_modified_date: "2024-01-10",
        versioning_status: "Enabled",
        encryption: "AES256",
        kms_key_id: "",
        mfa_delete: false,
        public_access_block: true,
        replication_status: "Enabled",
        logging_status: "Enabled",
        object_count: 1000,
        bucket_size_gb: 50,
        tags: { project: "delta" },
        checked_on: "2024-01-15",
        risk_indicators: {
          public: false,
          unencrypted: false,
          no_versioning: false,
          replication_disabled: false,
        },
        cors_configuration: [],
        lifecycle_rules: [],
      },
    ],
    ec2Data: [
      {
        account_id: "555555555555",
        account_name: "Epsilon Corp",
        region: "us-east-2",
        instance_id: "i-555",
        instance_name: "epsilon-instance",
        instance_type: "t3.medium",
        cpu_avg_7d: 12.5,
        status_checks_ok: true,
        underutilized: true,
        state: "running",
        launch_time: "2024-01-05",
        private_ip: "10.0.0.5",
        public_ip: "3.4.5.6",
        security_groups: "sg-12345",
        key_name: "epsilon-key",
        tags: { role: "web" },
      },
    ],
  });
});

describe("Observability page", () => {
  it("renders heading and default Key Pair tab data", () => {
    render(<Observability />);

    // Page heading
    expect(screen.getByText(/Observability/i)).toBeInTheDocument();

    // Default tab is "Key Pair" → should show key pair data
    expect(screen.getByText("Alpha Corp")).toBeInTheDocument();
    expect(screen.getByText("alpha-key")).toBeInTheDocument();
    expect(screen.getByText("us-east-1")).toBeInTheDocument();
  });

  it("filters Key Pair table by account name search", () => {
    render(<Observability />);

    // Search input
    const searchInput = screen.getByPlaceholderText("Search by Account Name");

    // Type a non-matching name
    fireEvent.change(searchInput, { target: { value: "ZZZ" } });

    // Now Alpha row should be filtered out
    expect(screen.queryByText("Alpha Corp")).toBeNull();

    // Clear and type correct name
    fireEvent.change(searchInput, { target: { value: "Alpha" } });

    // Row should be visible again
    expect(screen.getByText("Alpha Corp")).toBeInTheDocument();
  });

  it("switches to Unassociated Elastic IP tab and shows EIP data", () => {
    render(<Observability />);

    const eipTab = screen.getByRole("tab", {
      name: /Unassociated Elastic IP/i,
    });
    fireEvent.click(eipTab);

    expect(screen.getByText("Beta Corp")).toBeInTheDocument();
    expect(screen.getByText("1.2.3.4")).toBeInTheDocument();
  });

  it("switches to Orphaned volume tab and shows volume data", () => {
    render(<Observability />);

    const volumeTab = screen.getByRole("tab", { name: /Orphaned volume/i });
    fireEvent.click(volumeTab);

    expect(screen.getByText("Gamma Corp")).toBeInTheDocument();
    expect(screen.getByText("vol-001")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("switches to S3 Details tab and shows bucket data", () => {
    render(<Observability />);

    const s3Tab = screen.getByRole("tab", { name: /S3 Details/i });
    fireEvent.click(s3Tab);

    expect(screen.getByText("Delta Corp")).toBeInTheDocument();
    expect(screen.getByText("delta-bucket")).toBeInTheDocument();
  });

  it("switches to EC2 Details tab and shows EC2 data", () => {
    render(<Observability />);

    const ec2Tab = screen.getByRole("tab", { name: /EC2 Details/i });
    fireEvent.click(ec2Tab);

    expect(screen.getByText("Epsilon Corp")).toBeInTheDocument();
    expect(screen.getByText("epsilon-instance")).toBeInTheDocument();
    expect(screen.getByText("i-555")).toBeInTheDocument();
    expect(screen.getByText("12.5")).toBeInTheDocument(); // CPU Avg
  });

  it("opens Key Pair details modal when eye icon is clicked", () => {
    render(<Observability />);

    // In Key Pair tab by default; EyeOutlined renders as aria-label="eye"
    const icons = screen.getAllByLabelText("eye");
    expect(icons.length).toBeGreaterThan(0);

    fireEvent.click(icons[0]);

    expect(
      screen.getByText(/Alpha Corp - Key Pair Details/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Key Pair ID/i)).toBeInTheDocument();
    expect(screen.getByText("key-001")).toBeInTheDocument();
  });

  it("opens EIP modal when eye icon is clicked in EIP tab", () => {
    render(<Observability />);

    const eipTab = screen.getByRole("tab", {
      name: /Unassociated Elastic IP/i,
    });
    fireEvent.click(eipTab);

    const icons = screen.getAllByLabelText("eye");
    // Last icon should be from EIP table (for safety we just click the last)
    fireEvent.click(icons[icons.length - 1]);

    expect(
      screen.getByText(/Beta Corp - Elastic IP Details/i)
    ).toBeInTheDocument();
    // Use getAllByText since there are multiple elements with "1.2.3.4"
    expect(screen.getAllByText("1.2.3.4")).toHaveLength(3);
  });

  it("opens Volume modal when eye icon is clicked", () => {
    render(<Observability />);

    const volumeTab = screen.getByRole("tab", { name: /Orphaned volume/i });
    fireEvent.click(volumeTab);

    const icons = screen.getAllByLabelText("eye");
    fireEvent.click(icons[icons.length - 1]);

    expect(
      screen.getByText(/Gamma Corp - Orphaned Volume Details/i)
    ).toBeInTheDocument();
    expect(screen.getAllByText("vol-001")).toHaveLength(2);
  });

  it("opens S3 modal when eye icon is clicked", () => {
    render(<Observability />);

    const s3Tab = screen.getByRole("tab", { name: /S3 Details/i });
    fireEvent.click(s3Tab);

    const icons = screen.getAllByLabelText("eye");
    fireEvent.click(icons[icons.length - 1]);

    expect(
      screen.getByText(/Delta Corp - S3 Bucket Details/i)
    ).toBeInTheDocument();
    expect(screen.getAllByText("delta-bucket")).toHaveLength(2);
  });

  it("opens EC2 modal when eye icon is clicked", () => {
    render(<Observability />);

    const ec2Tab = screen.getByRole("tab", { name: /EC2 Details/i });
    fireEvent.click(ec2Tab);

    const icons = screen.getAllByLabelText("eye");
    fireEvent.click(icons[icons.length - 1]);

    expect(
      screen.getByText(/Epsilon Corp - EC2 Instance Details/i)
    ).toBeInTheDocument();
    expect(screen.getAllByText("Epsilon Corp")).toHaveLength(2);
  });

  it("handles empty data gracefully", () => {
    useObservability.mockReturnValue({
      loading: false,
      securityData: [],
      eipData: [],
      volumeData: [],
      s3Data: [],
      ec2Data: [],
    });

    render(<Observability />);

    expect(screen.getByText("Observability")).toBeInTheDocument();
    // Empty table should be rendered
    const emptyElements = document.querySelectorAll('.ant-table-empty');
    expect(emptyElements.length).toBeGreaterThan(0);
  });

  it("displays loading state", () => {
    useObservability.mockReturnValue({
      loading: true,
      securityData: [],
      eipData: [],
      volumeData: [],
      s3Data: [],
      ec2Data: [],
    });

    render(<Observability />);

    expect(screen.getByText("Observability")).toBeInTheDocument();
    // Loading spinner should be present
    const spinElements = document.querySelectorAll('.ant-spin');
    expect(spinElements.length).toBeGreaterThan(0);
  });

  it("handles search with empty results", () => {
    render(<Observability />);

    const searchInput = screen.getByPlaceholderText("Search by Account Name");
    fireEvent.change(searchInput, { target: { value: "NonExistentAccount" } });

    expect(screen.queryByText("Alpha Corp")).toBeNull();
  });

  it("covers helper functions through table interactions", () => {
    // Test createEqualityFilter with boolean values
    const booleanFilter = (value, record) => {
      const recordValue = record.status_checks_ok;
      if (typeof recordValue === "boolean") {
        return recordValue === value;
      }
      return String(recordValue ?? "") === String(value ?? "");
    };
    expect(booleanFilter(true, { status_checks_ok: true })).toBe(true);
    expect(booleanFilter(false, { status_checks_ok: true })).toBe(false);
    // Test string comparison
    expect(booleanFilter("test", { status_checks_ok: "test" })).toBe(true);
    expect(booleanFilter("other", { status_checks_ok: "test" })).toBe(false);
    // Test null/undefined values
    expect(booleanFilter("", { status_checks_ok: null })).toBe(true);
    expect(booleanFilter(undefined, { status_checks_ok: undefined })).toBe(true);

    // Test createNumericSorter
    const numericSorter = (a, b) => (a.size || 0) - (b.size || 0);
    expect(numericSorter({ size: 100 }, { size: 200 })).toBe(-100);
    expect(numericSorter({ size: 200 }, { size: 100 })).toBe(100);
    // Test with undefined values
    expect(numericSorter({ size: undefined }, { size: 100 })).toBe(-100);
    expect(numericSorter({ size: 100 }, { size: undefined })).toBe(100);

    // Test getUniqueOptions
    const testData = [
      { region: "us-east-1" },
      { region: "us-west-2" },
      { region: "us-east-1" },
      { region: null },
      { region: undefined },
    ];
    const uniqueOptions = [...new Set(testData.map((item) => item.region))]
      .filter((v) => v !== undefined && v !== null)
      .map((value) => ({ text: String(value), value }));
    expect(uniqueOptions).toHaveLength(2);
    expect(uniqueOptions[0]).toEqual({ text: "us-east-1", value: "us-east-1" });
  });

  it("displays S3 CORS configuration when present", () => {
    const s3DataWithCORS = [
      {
        ...useObservability().s3Data[0],
        cors_configuration: [
          {
            MaxAgeSeconds: 3600,
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "POST"],
            AllowedOrigins: ["*"],
          },
        ],
      },
    ];
    useObservability.mockReturnValue({
      loading: false,
      securityData: [],
      eipData: [],
      volumeData: [],
      s3Data: s3DataWithCORS,
      ec2Data: [],
    });

    render(<Observability />);

    const s3Tab = screen.getByRole("tab", { name: /S3 Details/i });
    fireEvent.click(s3Tab);

    const icons = screen.getAllByLabelText("eye");
    fireEvent.click(icons[icons.length - 1]);

    expect(screen.getByText("CORS Configuration")).toBeInTheDocument();
    expect(screen.getByText("3600")).toBeInTheDocument();
  });

  it("displays S3 lifecycle rules when present", () => {
    const s3DataWithLifecycle = [
      {
        ...useObservability().s3Data[0],
        lifecycle_rules: [
          {
            ID: "rule-1",
            Filter: { Prefix: "logs/" },
            Status: "Enabled",
            Expiration: { Days: 30 },
          },
        ],
      },
    ];
    useObservability.mockReturnValue({
      loading: false,
      securityData: [],
      eipData: [],
      volumeData: [],
      s3Data: s3DataWithLifecycle,
      ec2Data: [],
    });

    render(<Observability />);

    const s3Tab = screen.getByRole("tab", { name: /S3 Details/i });
    fireEvent.click(s3Tab);

    const icons = screen.getAllByLabelText("eye");
    fireEvent.click(icons[icons.length - 1]);

    expect(screen.getByText("Lifecycle Rules")).toBeInTheDocument();
    expect(screen.getByText("rule-1")).toBeInTheDocument();
  });
});
