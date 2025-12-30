// ObservabilityContext.test.jsx
import React from "react";
import { render, screen, act } from "@testing-library/react";
import { vi } from "vitest";
import axios from "axios";

vi.mock("axios");

// Mock the api module to avoid interceptors issue
vi.mock("c:/project/jit_ms1/Security_ims/src/lib/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: {
        use: vi.fn()
      }
    }
  }
}));

// Import provider & hook AFTER mocking axios
import { ObservabilityProvider, useObservability } from "c:/project/jit_ms1/Security_ims/src/Context/ObservabilityContext";

// A small consumer to inspect context values and trigger fetchers
function ConsumerDisplay() {
  const {
    loading,
    securityData,
    eipData,
    volumeData,
    s3Data,
    ec2Data,
    fetchKeyPairs,
    fetchEIP,
    fetchVolumes,
    fetchS3,
    fetchEC2,
  } = useObservability();

  return (
    <div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="security-count">{securityData.length}</div>
      <div data-testid="eip-count">{eipData.length}</div>
      <div data-testid="volume-count">{volumeData.length}</div>
      <div data-testid="s3-count">{s3Data.length}</div>
      <div data-testid="ec2-count">{ec2Data.length}</div>

      <button data-testid="call-keypairs" onClick={fetchKeyPairs}>call keypairs</button>
      <button data-testid="call-eip" onClick={fetchEIP}>call eip</button>
      <button data-testid="call-vol" onClick={fetchVolumes}>call vol</button>
      <button data-testid="call-s3" onClick={fetchS3}>call s3</button>
      <button data-testid="call-ec2" onClick={fetchEC2}>call ec2</button>
    </div>
  );
}

describe("ObservabilityContext", () => {
  const API_BASE = "http://47.130.218.97:8012";

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test("on mount calls 5 POST endpoints and populates data when localStorage account_ids is JSON array", async () => {
    // Arrange: set account_ids as JSON array
    localStorage.setItem("account_ids", JSON.stringify(["A1","A2"]));

    // Prepare axios.post to resolve with arrays for each call (in order)
    axios.post
      .mockResolvedValueOnce({ data: [{ id: "k1" }] }) // keypairs
      .mockResolvedValueOnce({ data: [{ id: "e1" }] }) // eip
      .mockResolvedValueOnce({ data: [{ id: "v1" }] }) // volumes
      .mockResolvedValueOnce({ data: [{ id: "s1" }] }) // s3
      .mockResolvedValueOnce({ data: [{ id: "c1" }] }); // ec2

    await act(async () => {
      render(
        <ObservabilityProvider>
          <ConsumerDisplay />
        </ObservabilityProvider>
      );
    });

    // Expect axios.post called 5 times with POST_BODY built from localStorage
    expect(axios.post).toHaveBeenCalledTimes(5);
    expect(axios.post).toHaveBeenCalledWith(
      `${API_BASE}/keypairs2/filter`,
      { account_ids: ["A1","A2"] },
      expect.any(Object)
    );
    expect(axios.post).toHaveBeenCalledWith(
      `${API_BASE}/orphaned-eip/filter`,
      { account_ids: ["A1","A2"] },
      expect.any(Object)
    );

    // Check consumer shows counts (render updates after resolved promises)
    expect(await screen.findByTestId("security-count")).toHaveTextContent("1");
    expect(screen.getByTestId("eip-count")).toHaveTextContent("1");
    expect(screen.getByTestId("volume-count")).toHaveTextContent("1");
    expect(screen.getByTestId("s3-count")).toHaveTextContent("1");
    expect(screen.getByTestId("ec2-count")).toHaveTextContent("1");
  });

  test("POST_BODY uses single string from localStorage when account_ids is plain string", async () => {
    localStorage.setItem("account_ids", "SINGLE_ID");

    // Make all axios calls resolve with empty arrays so component continues
    axios.post.mockResolvedValue({ data: [] });

    await act(async () => {
      render(
        <ObservabilityProvider>
          <ConsumerDisplay />
        </ObservabilityProvider>
      );
    });

    // All calls should have used ["SINGLE_ID"]
    for (let call of axios.post.mock.calls) {
      const [, body] = call;
      expect(body).toEqual({ account_ids: ["SINGLE_ID"] });
    }
  });

  test("invalid JSON in localStorage gracefully converts to array of the raw value", async () => {
    // invalid JSON
    localStorage.setItem("account_ids", "not-a-json");

    axios.post.mockResolvedValue({ data: [] });

    await act(async () => {
      render(
        <ObservabilityProvider>
          <ConsumerDisplay />
        </ObservabilityProvider>
      );
    });

    // Should call endpoints with ["not-a-json"]
    for (let call of axios.post.mock.calls) {
      const [, body] = call;
      expect(body).toEqual({ account_ids: ["not-a-json"] });
    }
  });

  test("manual fetchKeyPairs updates securityData and handles rejection by setting empty array", async () => {
    // set account_ids
    localStorage.setItem("account_ids", JSON.stringify(["ABC"]));

    // First axios for mount: return empty arrays for all but we'll override keypairs below
    axios.post.mockResolvedValue({ data: [] });

    // Render
    await act(async () => {
      render(
        <ObservabilityProvider>
          <ConsumerDisplay />
        </ObservabilityProvider>
      );
    });

    // Now simulate fetchKeyPairs successful call
    axios.post.mockResolvedValueOnce({ data: [{ id: "kp-1" }, { id: "kp-2" }] });

    // click the button to call fetchKeyPairs
    await act(async () => {
      screen.getByTestId("call-keypairs").click();
    });

    expect(axios.post).toHaveBeenCalledWith(
      `${API_BASE}/keypairs2/filter`,
      { account_ids: ["ABC"] },
      expect.any(Object)
    );

    // After successful fetch, expect security-count updated
    expect(await screen.findByTestId("security-count")).toHaveTextContent("2");

    // Now simulate rejection — subsequent manual fetch should set empty array
    axios.post.mockRejectedValueOnce(new Error("Network fail"));

    await act(async () => {
      screen.getByTestId("call-keypairs").click();
    });

    // security-count should be "0" after failed fetch
    expect(await screen.findByTestId("security-count")).toHaveTextContent("0");
  });

  test("loading toggles while requests are in-flight", async () => {
    localStorage.setItem("account_ids", JSON.stringify(["X"]));

    // Create a promise that resolves after a delay
    let resolve;
    const p = new Promise((res) => {
      resolve = res;
    });
    
    // Mock the first call to return the pending promise, others resolve immediately
    axios.post
      .mockReturnValueOnce(p)
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    // Start rendering
    render(
      <ObservabilityProvider>
        <ConsumerDisplay />
      </ObservabilityProvider>
    );

    // Check that loading is initially true (component should render with loading=true)
    expect(screen.getByTestId("loading")).toHaveTextContent("true");

    // Resolve the pending promise
    await act(async () => {
      resolve({ data: [] });
    });

    // Now loading should be false
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
  });

  test("fetch helper endpoints (eip/vol/s3/ec2) can be invoked and set respective states", async () => {
    localStorage.setItem("account_ids", JSON.stringify(["Z"]));

    // initial mount calls: return empty arrays
    axios.post.mockResolvedValue({ data: [] });

    await act(async () => {
      render(
        <ObservabilityProvider>
          <ConsumerDisplay />
        </ObservabilityProvider>
      );
    });

    // Prepare distinct responses for each manual call
    axios.post
      .mockResolvedValueOnce({ data: [{ id: "e-a" }] }) // eip
      .mockResolvedValueOnce({ data: [{ id: "v-a" }] }) // volume
      .mockResolvedValueOnce({ data: [{ id: "s-a" }] }) // s3
      .mockResolvedValueOnce({ data: [{ id: "c-a" }] }); // ec2

    await act(async () => {
      screen.getByTestId("call-eip").click();
    });
    expect(await screen.findByTestId("eip-count")).toHaveTextContent("1");

    await act(async () => {
      screen.getByTestId("call-vol").click();
    });
    expect(await screen.findByTestId("volume-count")).toHaveTextContent("1");

    await act(async () => {
      screen.getByTestId("call-s3").click();
    });
    expect(await screen.findByTestId("s3-count")).toHaveTextContent("1");

    await act(async () => {
      screen.getByTestId("call-ec2").click();
    });
    expect(await screen.findByTestId("ec2-count")).toHaveTextContent("1");
  });
});
