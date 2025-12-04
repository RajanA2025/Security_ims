// Compliancechild.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { CostContext } from "c:/project/jit_ms1/Security_ims/src/Context/CostContext";
import Compliancechild from "c:/project/jit_ms1/Security_ims/src/components/CostComponents/Complaincechild.jsx";

// ----------------------
// Mock antd components used by Compliancechild
// ----------------------
vi.mock("antd", () => {
  const React = require("react");

  // Simple Tag mock showing its children text content
  const Tag = ({ color, children }) => (
    <span data-testid="antd-tag" data-color={color}>
      {children}
    </span>
  );

  // Spin mock
  const Spin = ({ tip }) => <div data-testid="antd-spin">SPIN - {tip}</div>;

  // Alert mock: show message & description if provided
  const Alert = ({ message, description, type, showIcon }) => (
    <div data-testid="antd-alert" data-type={type}>
      <strong>{message}</strong>
      {description ? <div>{description}</div> : null}
    </div>
  );

  // Minimal Table mock that uses provided columns and dataSource to render a simple table
  const Table = ({ dataSource = [], columns = [] }) => {
    return (
      <table data-testid="antd-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key || col.dataIndex}>{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataSource.map((row, rIdx) => (
            <tr key={row.id ?? rIdx} data-testid="table-row">
              {columns.map((col, cIdx) => {
                // prefer render function
                if (typeof col.render === "function") {
                  return (
                    <td key={cIdx} data-testid={`cell-${cIdx}`}>
                      {col.render(row[col.dataIndex], row)}
                    </td>
                  );
                }
                // fallback to dataIndex
                return <td key={cIdx}>{row[col.dataIndex]}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return { Table, Spin, Alert, Tag };
});

// ----------------------
// Mock the CostContext so we can provide values via provider in tests
// ----------------------
vi.mock("c:/project/jit_ms1/Security_ims/src/Context/CostContext", async () => {
  const React = await vi.importActual("react");
  return {
    CostContext: React.createContext(),
  };
});

describe("Compliancechild component", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  test("shows loading spinner when loading=true", () => {
    render(
      <CostContext.Provider value={{ tagData: [], loading: true, error: null }}>
        <Compliancechild />
      </CostContext.Provider>
    );

    expect(screen.getByTestId("antd-spin")).toBeInTheDocument();
    expect(screen.getByText(/SPIN - Loading.../i)).toBeInTheDocument();
  });

  test("shows error Alert when error is present", () => {
    render(
      <CostContext.Provider value={{ tagData: [], loading: false, error: "Boom!" }}>
        <Compliancechild />
      </CostContext.Provider>
    );

    const alert = screen.getByTestId("antd-alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("Error");
    expect(alert).toHaveTextContent("Boom!");
  });

  test("shows 'No matching accounts found' when filtered dataset is empty", () => {
    // localStorage has account id "100"
    localStorage.setItem("account_ids", JSON.stringify(["100"]));

    // tagData contains items for other account ids so filtered result should be empty
    const tagData = [
      { account_id: "1", account_name: "A", region: "r1", service: "s1", resource: "arn:1", tags: {} },
    ];

    render(
      <CostContext.Provider value={{ tagData, loading: false, error: null }}>
        <Compliancechild />
      </CostContext.Provider>
    );

    const info = screen.getByTestId("antd-alert");
    expect(info).toBeInTheDocument();
    expect(info).toHaveTextContent("No matching accounts found");
  });

  test("renders table rows and correct tag status, available and missing tags", () => {
    // Set account ids that will match two items
    localStorage.setItem("account_ids", JSON.stringify(["10", "20"]));

    const tagData = [
      // Fully tagged (all required keys present)
      {
        account_id: "10",
        account_name: "Account Ten",
        region: "us-east-1",
        service: "EC2",
        resource: "arn:aws:ec2:instance/1",
        tags: { Name: "srv1", Owner: "Alice", Project: "P1", Environment: "Prod" },
      },
      // Partially tagged (some tags missing)
      {
        account_id: "20",
        account_name: "Account Twenty",
        region: "us-west-2",
        service: "S3",
        resource: "arn:aws:s3:::bucket1",
        tags: { Name: "bucket1", Owner: "", Project: null, Environment: undefined },
      },
      // Not included (different account id)
      {
        account_id: "99",
        account_name: "Other",
        region: "eu-west-1",
        service: "RDS",
        resource: "arn:aws:rds:db/1",
        tags: {},
      },
    ];

    render(
      <CostContext.Provider value={{ tagData, loading: false, error: null }}>
        <Compliancechild />
      </CostContext.Provider>
    );

    // Table should render only two rows (for account_id 10 and 20)
    const rows = screen.getAllByTestId("table-row");
    expect(rows.length).toBe(2);

    // Check first row (Fully Tagged)
    // We rendered Tag as span with data-testid="antd-tag"; find all tags in first row
    const firstRowTag = rows[0].querySelector('[data-testid="antd-tag"]');
    expect(firstRowTag).toBeTruthy();
    expect(firstRowTag.textContent).toBe("Fully Tagged");

    // Available tags column (should list all required tags)
    expect(rows[0].textContent).toContain("Name, Owner, Project, Environment");

    // Missing tags column should be '-' for fully tagged (no missing)
    expect(rows[0].textContent).toContain("-");

    // Second row (Partially Tagged)
    const secondRowTag = rows[1].querySelector('[data-testid="antd-tag"]');
    expect(secondRowTag).toBeTruthy();
    expect(secondRowTag.textContent).toBe("Partially Tagged");

    // Available tags for second row should include only present non-empty ones (Name)
    expect(rows[1].textContent).toContain("Name");

    // Missing tags includes Owner, Project, Environment (Owner is empty string so missing)
    expect(rows[1].textContent).toContain("Owner");
    expect(rows[1].textContent).toContain("Project");
    expect(rows[1].textContent).toContain("Environment");
  });
});
