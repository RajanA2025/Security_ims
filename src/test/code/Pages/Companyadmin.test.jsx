import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Companyadmin from "@/pages/Companyadmin";
import React from "react";
import { vi } from "vitest";

// ------------------ MOCKS ------------------

// mock navigate()
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    BrowserRouter: ({ children }) => <div>{children}</div>,
  };
});

// mock fetch()
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        costaccounts: [
          {
            cid: "1",
            account_id: "A1",
            account_name: "Test Account",
            access_key: "ABC",
            secret_key: "XYZ",
            bucket_name: "bucket1",
            prefix: "pref1",
            cost: true,
            security: true,
            perfops: true,
          },
        ],
      }),
  })
);

// mock axios.delete()
vi.mock("axios", () => ({
  default: {
    delete: vi.fn(() => Promise.resolve({})),
  },
}));

// ------------------ TESTS ------------------

describe("Companyadmin Component Full Test", () => {
  beforeEach(() => {
    localStorage.setItem("company_cid", "1");
    mockNavigate.mockClear();
  });

  // 1️⃣ LOAD + SEARCH
  test("loads accounts, renders table and applies search", async () => {
    render(<Companyadmin />);

    expect(screen.getByText("Loading accounts...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Test Account")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      "Search by name, account, or bucket..."
    );

    fireEvent.change(searchInput, { target: { value: "A1" } });

    expect(screen.getByText("A1")).toBeInTheDocument();
  });

  // 2️⃣ DELETE MODAL + DELETE ACCOUNT
  test.skip("opens delete modal and deletes account", async () => {
    render(<Companyadmin />);

    await waitFor(() => {
      expect(screen.getByText("Test Account")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole("button")[1]); // Second button (delete)

    await waitFor(() => {
      expect(
        screen.getByText("Are you sure you want to delete this account?")
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Yes, Delete Account"));

    await waitFor(() => {
      expect(screen.queryByText("Test Account")).not.toBeInTheDocument();
    });
  });

  // 3️⃣ EDIT BUTTON → NAVIGATE
  test.skip("edit button calls navigate()", async () => {
    render(<Companyadmin />);

    await waitFor(() => {
      expect(screen.getByText("Test Account")).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole("button")[0]); // First button (edit)

    expect(mockNavigate).toHaveBeenCalledWith("/imsproduct/accounts");
  });
});
