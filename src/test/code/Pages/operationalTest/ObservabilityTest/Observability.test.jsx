// Observability.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { vi } from "vitest";
import Observability from "@/pages/operational/Observability/Observability"; // adjust path if needed

// Mock window.matchMedia for Ant Design responsive observer
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

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock axios and api
vi.mock("axios", () => ({ 
  default: { 
    post: vi.fn(),
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
    }))
  } 
}));
vi.mock("@/lib/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}));
import api from "@/lib/api";

// Mock the ObservabilityContext hook
vi.mock("@/Context/ObservabilityContext", () => {
  const SAMPLE_SECURITY = [
    {
      key_id: "kp-1",
      key_pair_id: "kp-1",
      account_id: "111111111111",
      account_name: "AlphaAccount",
      region: "us-east-1",
      key_name: "alpha-key",
      key_type: "rsa",
      key_fingerprint: "fp-111",
      create_time: "2025-11-01T00:00:00Z",
      status: "Orphaned",
      instance_id: "i-aaa111",
      instance_name: "alpha-instance",
      tags: { env: "dev" },
    },
    {
      key_id: "kp-2",
      key_pair_id: "kp-2",
      account_id: "222222222222",
      account_name: "BetaAccount",
      region: "us-west-2",
      key_name: "beta-key",
      key_type: "rsa",
      key_fingerprint: "fp-222",
      create_time: "2025-11-02T00:00:00Z",
      status: "Disabled",
      instance_id: null,
      instance_name: null,
      tags: {},
    },
  ];

  const SAMPLE_EIP = [
    {
      allocation_id: "eip-1",
      account_id: "111111111111",
      account_name: "AlphaAccount",
      region: "us-east-1",
      public_ip: "1.2.3.4",
      domain: "vpc",
      public_ipv4_pool: "pool-1",
      status: "available",
      instance_id: "i-aaa111",
      instance_name: "alpha-instance",
      association_id: "eipassoc-1",
      tags: { env: "dev" },
    },
    {
      allocation_id: "eip-2",
      account_id: "222222222222",
      account_name: "BetaAccount",
      region: "us-west-2",
      public_ip: "5.6.7.8",
      domain: "vpc",
      instance_id: null,
      instance_name: null,
      association_id: null,
      tags: {},
    },
  ];

  const SAMPLE_VOLUME = [
    {
      volume_id: "vol-1",
      account_id: "111111111111",
      account_name: "AlphaAccount",
      region: "us-east-1",
      availability_zone: "us-east-1a",
      volume_type: "gp3",
      size_gb: 100,
      state: "in-use",
      iops: 3000,
      throughput: 125,
      encrypted: true,
      attachments: [
        {
          device: "/dev/sda1",
          instance_id: "i-aaa111",
          instance_name: "alpha-instance",
          state: "attached",
          delete_on_termination: false,
        },
      ],
      tags: { env: "dev" },
    },
  ];

  const SAMPLE_S3 = [
    {
      bucket_name: "alpha-bucket",
      account_id: "111111111111",
      account_name: "AlphaAccount",
      region: "us-east-1",
      creation_date: "2025-01-01T00:00:00Z",
      versioning: "Enabled",
      mfa_delete: "Disabled",
      public_access_blocked: true,
      object_count: 1500,
      size_bytes: 1073741824,
      tags: { env: "dev" },
    },
  ];

  const SAMPLE_EC2 = [
    {
      instance_id: "i-aaa111",
      account_id: "111111111111",
      account_name: "AlphaAccount",
      region: "us-east-1",
      instance_type: "t3.medium",
      state: "running",
      public_ip: "1.2.3.4",
      private_ip: "10.0.1.100",
      availability_zone: "us-east-1a",
      launch_time: "2025-01-01T00:00:00Z",
      monitoring_state: "enabled",
      instance_name: "alpha-instance",
      cpu_avg_7d: 12.3,
      status_checks_ok: true,
      underutilized: false,
      state: "running",
    },
  ];

  // Provide setter mocks globally so component won't break
  global.setSecurityData = vi.fn();
  global.seteipData = vi.fn();
  global.setVolumeData = vi.fn();
  global.setS3Data = vi.fn();
  global.setEC2Data = vi.fn();

  return {
    useObservability: () => ({
      securityData: SAMPLE_SECURITY,
      eipData: SAMPLE_EIP,
      volumeData: SAMPLE_VOLUME,
      s3Data: SAMPLE_S3,
      ec2Data: SAMPLE_EC2,
      // Provide setter mocks so component's useEffect won't break if it calls them
      setSecurityData: global.setSecurityData,
      seteipData: global.seteipData,
      setVolumeData: global.setVolumeData,
      setS3Data: global.setS3Data,
      setEC2Data: global.setEC2Data,
    }),
  };
});

describe("Observability component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders Observability title and Key Pair table rows from context", async () => {
    render(<Observability />);

    // Title
    expect(screen.getByText("Observability")).toBeInTheDocument();

    // Wait for table to render a known account name from mock context
    expect(await screen.findByText("AlphaAccount", {}, { timeout: 10000 })).toBeInTheDocument();
    expect(screen.getByText("alpha-key")).toBeInTheDocument();
    expect(screen.getByText("Orphaned")).toBeInTheDocument();

    // Second row
    expect(screen.getByText("BetaAccount")).toBeInTheDocument();
    expect(screen.getByText("beta-key")).toBeInTheDocument();
  }, 15000);

  test("search by Account Name filters table rows", async () => {
    render(<Observability />);

    // wait for table rows
    await screen.findByText("AlphaAccount");

    const input = screen.getByPlaceholderText("Search by Account Name");
    // search for BetaAccount
    fireEvent.change(input, { target: { value: "BetaAccount" } });

    await waitFor(() => {
      expect(screen.queryByText("AlphaAccount")).not.toBeInTheDocument();
      expect(screen.getByText("BetaAccount")).toBeInTheDocument();
    });

    // clear search
    fireEvent.change(input, { target: { value: "" } });
    await waitFor(() => {
      expect(screen.getByText("AlphaAccount")).toBeInTheDocument();
      expect(screen.getByText("BetaAccount")).toBeInTheDocument();
    });
  }, 15000);

  test("switching tabs triggers API fetch for the new tab", async () => {
    const mockedGet = api.get;
    mockedGet.mockResolvedValue({ data: [] });

    render(<Observability />);

    // Key Pair tab is default — initial useEffect runs but our mock api.get was called
    await waitFor(() => {
      expect(mockedGet).toHaveBeenCalled();
    });

    // Find tab button for "Unassociated Elastic IP" and click it
    const tab = screen.getByRole("tab", { name: /Unassociated Elastic IP/i });
    fireEvent.click(tab);

    // After switching tabKey, component's useEffect should call api.get for EIP endpoint
    await waitFor(() => {
      expect(mockedGet).toHaveBeenCalledWith(
        expect.stringContaining("orphaned-eip")
      );
    });
  }, 15000);

  // test("clicking Eye icon opens details modal (best-effort selector)", async () => {
  //   const { container } = render(<Observability />);

  //   // Wait for table to render
  //   await screen.findByText("AlphaAccount");

  //   // Locate the first table row that contains AlphaAccount
  //   const row = container.querySelector("tbody")?.querySelector("tr");
  //   expect(row).toBeTruthy();

  //   // Find an SVG (Eye icon) inside that row and click it
  //   const svg = row.querySelector("svg");
  //   if (svg) {
  //     fireEvent.click(svg);
  //     // After click, expect modal title to contain "Key Pair Details" or the account name
  //     await waitFor(() => {
  //       const modalTitle = container.querySelector(".ant-modal-title")?.textContent || "";
  //       expect(
  //         modalTitle.includes("Key Pair Details") || modalTitle.includes("AlphaAccount")
  //       ).toBeTruthy();
  //     });
  //   } else {
  //     // If no svg found (DOM differences), make the test informative but non-failing
  //     // Suggest adding data-testid attributes to EyeOutlined for stable selection
  //     expect(true).toBe(true);
  //   }
  // });
});
