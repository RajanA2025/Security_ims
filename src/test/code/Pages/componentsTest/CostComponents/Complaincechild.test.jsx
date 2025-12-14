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
  const Table = ({ 
    dataSource = [], 
    columns = [], 
    pagination,
    scroll 
  }) => {
    const [filteredData, setFilteredData] = React.useState(dataSource);
    const [filters, setFilters] = React.useState({});

    // Apply filters when they change
    React.useEffect(() => {
      let result = [...dataSource];
      Object.entries(filters).forEach(([key, value]) => {
        if (!value) return;
        result = result.filter(item => {
          const column = columns.find(col => col.dataIndex === key || col.key === key);
          if (column?.onFilter) {
            return column.onFilter(value, item);
          }
          return true;
        });
      });
      setFilteredData(result);
    }, [filters, dataSource, columns]);

    // Apply pagination
    const paginatedData = pagination 
      ? filteredData.slice(0, pagination.pageSize)
      : filteredData;

    return (
      <div data-testid="antd-table">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key || col.dataIndex}>
                  {col.title}
                  {col.filters && (
                    <select
                      data-testid={`filter-${col.dataIndex || col.key}`}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFilters(prev => ({
                          ...prev,
                          [col.dataIndex || col.key]: value || undefined
                        }));
                      }}
                    >
                      <option value="">All</option>
                      {col.filters.map((filter, i) => (
                        <option key={i} value={filter.value}>
                          {filter.text}
                        </option>
                      ))}
                    </select>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rIdx) => (
              <tr key={row.id ?? rIdx} data-testid="table-row">
                {columns.map((col, cIdx) => (
                  <td key={cIdx} data-testid={`cell-${cIdx}`}>
                    {typeof col.render === 'function' 
                      ? col.render(row[col.dataIndex], row)
                      : row[col.dataIndex]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

  test("shows correct available and missing tags", () => {
    localStorage.setItem("account_ids", JSON.stringify(["10", "20", "30"]));
    
    render(
      <CostContext.Provider value={{
        tagData: [
          {
            account_id: "10",
            account_name: "Account Ten",
            region: "us-east-1",
            service: "EC2",
            resource: "arn:aws:ec2:instance/1",
            tags: { Name: "srv1", Owner: "Alice", Project: "P1", Environment: "Prod" },
          },
          {
            account_id: "20",
            account_name: "Account Twenty",
            region: "us-west-2",
            service: "S3",
            resource: "arn:aws:s3:::bucket1",
            tags: { Name: "bucket1", Owner: "", Project: null, Environment: undefined },
          },
          {
            account_id: "30",
            account_name: "Account Thirty",
            region: "eu-west-1",
            service: "RDS",
            resource: "arn:aws:rds:db/1",
            tags: {},
          },
        ],
        loading: false,
        error: null
      }}>
        <Compliancechild />
      </CostContext.Provider>
    );

    const rows = screen.getAllByTestId("table-row");
    expect(rows).toHaveLength(3);

    // Check all dash elements
    const dashElements = screen.getAllByText("-");
    expect(dashElements).toHaveLength(2); // One for fully tagged, one for not tagged

    // Check all missing tags elements
    const missingTagsElements = screen.getAllByText("Name, Owner, Project, Environment");
    expect(missingTagsElements).toHaveLength(2); // One for fully tagged, one for not tagged

    // First row (fully tagged)
    expect(rows[0]).toContainElement(missingTagsElements[0]);
    expect(rows[0]).toContainElement(dashElements[0]);

    // Second row (partially tagged)
    expect(rows[1]).toContainElement(screen.getByText("Name"));
    expect(rows[1]).toContainElement(screen.getByText("Owner, Project, Environment"));

    // Third row (not tagged)
    expect(rows[2]).toContainElement(missingTagsElements[1]);
    expect(rows[2]).toContainElement(dashElements[1]);
  });

  test("filters by region", async () => {
    localStorage.setItem("account_ids", JSON.stringify(["10", "20", "30"]));
    
    render(
      <CostContext.Provider value={{
        tagData: [
          {
            account_id: "10",
            account_name: "Account Ten",
            region: "us-east-1",
            service: "EC2",
            resource: "arn:aws:ec2:instance/1",
            tags: { Name: "srv1", Owner: "Alice", Project: "P1", Environment: "Prod" },
          },
          {
            account_id: "20",
            account_name: "Account Twenty",
            region: "us-west-2",
            service: "S3",
            resource: "arn:aws:s3:::bucket1",
            tags: { Name: "bucket1", Owner: "", Project: null, Environment: undefined },
          },
          {
            account_id: "30",
            account_name: "Account Thirty",
            region: "eu-west-1",
            service: "RDS",
            resource: "arn:aws:rds:db/1",
            tags: {},
          },
        ],
        loading: false,
        error: null
      }}>
        <Compliancechild />
      </CostContext.Provider>
    );

    const regionFilter = screen.getByTestId("filter-region");
    fireEvent.change(regionFilter, { target: { value: "us-east-1" } });

    const rows = screen.getAllByTestId("table-row");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("us-east-1");
  });

  test("filters by service", async () => {
    localStorage.setItem("account_ids", JSON.stringify(["10", "20", "30"]));
    
    render(
      <CostContext.Provider value={{
        tagData: [
          {
            account_id: "10",
            account_name: "Account Ten",
            region: "us-east-1",
            service: "EC2",
            resource: "arn:aws:ec2:instance/1",
            tags: { Name: "srv1", Owner: "Alice", Project: "P1", Environment: "Prod" },
          },
          {
            account_id: "20",
            account_name: "Account Twenty",
            region: "us-west-2",
            service: "S3",
            resource: "arn:aws:s3:::bucket1",
            tags: { Name: "bucket1", Owner: "", Project: null, Environment: undefined },
          },
          {
            account_id: "30",
            account_name: "Account Thirty",
            region: "eu-west-1",
            service: "RDS",
            resource: "arn:aws:rds:db/1",
            tags: {},
          },
        ],
        loading: false,
        error: null
      }}>
        <Compliancechild />
      </CostContext.Provider>
    );

    const serviceFilter = screen.getByTestId("filter-service");
    fireEvent.change(serviceFilter, { target: { value: "S3" } });

    const rows = screen.getAllByTestId("table-row");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("S3");
  });

  test("filters by account ID", async () => {
    localStorage.setItem("account_ids", JSON.stringify(["10", "20", "30"]));
    
    render(
      <CostContext.Provider value={{
        tagData: [
          {
            account_id: "10",
            account_name: "Account Ten",
            region: "us-east-1",
            service: "EC2",
            resource: "arn:aws:ec2:instance/1",
            tags: { Name: "srv1", Owner: "Alice", Project: "P1", Environment: "Prod" },
          },
          {
            account_id: "20",
            account_name: "Account Twenty",
            region: "us-west-2",
            service: "S3",
            resource: "arn:aws:s3:::bucket1",
            tags: { Name: "bucket1", Owner: "", Project: null, Environment: undefined },
          },
          {
            account_id: "30",
            account_name: "Account Thirty",
            region: "eu-west-1",
            service: "RDS",
            resource: "arn:aws:rds:db/1",
            tags: {},
          },
        ],
        loading: false,
        error: null
      }}>
        <Compliancechild />
      </CostContext.Provider>
    );

    const accountIdFilter = screen.getByTestId("filter-account_id");
    fireEvent.change(accountIdFilter, { target: { value: "20" } });

    const rows = screen.getAllByTestId("table-row");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("20");
  });

  test("handles null tags gracefully", () => {
    localStorage.setItem("account_ids", JSON.stringify(["10", "20"]));
    
    const dataWithNullTags = [
      {
        id: 1,
        account_id: "10",
        account_name: "Account Ten",
        region: "us-east-1",
        service: "EC2",
        resource: "arn:aws:ec2:instance/1",
        tags: null,
      },
      {
        id: 2,
        account_id: "20",
        account_name: "Account Twenty",
        region: "us-west-2",
        service: "S3",
        resource: "arn:aws:s3:::bucket1",
        tags: undefined,
      },
    ];

    render(
      <CostContext.Provider value={{ tagData: dataWithNullTags, loading: false, error: null }}>
        <Compliancechild />
      </CostContext.Provider>
    );

    const rows = screen.getAllByTestId("table-row");
    expect(rows).toHaveLength(2);

    const tags = screen.getAllByTestId("antd-tag");
    expect(tags[0]).toHaveTextContent("Not Tagged");
    expect(tags[0]).toHaveAttribute("data-color", "red");
    expect(tags[1]).toHaveTextContent("Not Tagged");
    expect(tags[1]).toHaveAttribute("data-color", "red");

    // Check that both rows have "-" for available tags
    const dashElements = screen.getAllByText("-");
    expect(dashElements).toHaveLength(2);
    
    // Check that both rows have missing tags text
    const missingTagsElements = screen.getAllByText("Name, Owner, Project, Environment");
    expect(missingTagsElements).toHaveLength(2);
  });

  test("handles empty tags object", () => {
    localStorage.setItem("account_ids", JSON.stringify(["10"]));
    
    const dataWithEmptyTags = [
      {
        id: 1,
        account_id: "10",
        account_name: "Account Ten",
        region: "us-east-1",
        service: "EC2",
        resource: "arn:aws:ec2:instance/1",
        tags: {},
      },
    ];

    render(
      <CostContext.Provider value={{ tagData: dataWithEmptyTags, loading: false, error: null }}>
        <Compliancechild />
      </CostContext.Provider>
    );

    const rows = screen.getAllByTestId("table-row");
    expect(rows).toHaveLength(1);

    const tags = screen.getAllByTestId("antd-tag");
    expect(tags[0]).toHaveTextContent("Not Tagged");
    expect(tags[0]).toHaveAttribute("data-color", "red");

    expect(rows[0]).toContainElement(screen.getByText("-"));
    expect(rows[0]).toContainElement(screen.getByText("Name, Owner, Project, Environment"));
  });

  test("handles tags with mixed null/empty/undefined values", () => {
    localStorage.setItem("account_ids", JSON.stringify(["10"]));
    
    const dataWithMixedTags = [
      {
        id: 1,
        account_id: "10",
        account_name: "Account Ten",
        region: "us-east-1",
        service: "EC2",
        resource: "arn:aws:ec2:instance/1",
        tags: {
          Name: "test",
          Owner: "valid_owner",
          Project: "",
          Environment: undefined,
        },
      },
    ];

    render(
      <CostContext.Provider value={{ tagData: dataWithMixedTags, loading: false, error: null }}>
        <Compliancechild />
      </CostContext.Provider>
    );

    const rows = screen.getAllByTestId("table-row");
    expect(rows).toHaveLength(1);

    const tags = screen.getAllByTestId("antd-tag");
    expect(tags[0]).toHaveTextContent("Partially Tagged");
    expect(tags[0]).toHaveAttribute("data-color", "gold");

    expect(rows[0]).toContainElement(screen.getByText("Name, Owner"));
    expect(rows[0]).toContainElement(screen.getByText("Project, Environment"));
  });

  test("handles empty tagData array", () => {
    render(
      <CostContext.Provider value={{ tagData: [], loading: false, error: null }}>
        <Compliancechild />
      </CostContext.Provider>
    );

    expect(screen.getByText(/No matching accounts found/i)).toBeInTheDocument();
  });

  test("handles undefined tagData", () => {
    render(
      <CostContext.Provider value={{ tagData: undefined, loading: false, error: null }}>
        <Compliancechild />
      </CostContext.Provider>
    );

    expect(screen.getByText(/No matching accounts found/i)).toBeInTheDocument();
  });

  test("applies localStorage filtering correctly", () => {
    localStorage.setItem("account_ids", JSON.stringify(["10", "30"]));

    render(
      <CostContext.Provider value={{
        tagData: [
          {
            account_id: "10",
            account_name: "Account Ten",
            region: "us-east-1",
            service: "EC2",
            resource: "arn:aws:ec2:instance/1",
            tags: { Name: "srv1", Owner: "Alice", Project: "P1", Environment: "Prod" },
          },
          {
            account_id: "20",
            account_name: "Account Twenty",
            region: "us-west-2",
            service: "S3",
            resource: "arn:aws:s3:::bucket1",
            tags: { Name: "bucket1", Owner: "", Project: null, Environment: undefined },
          },
          {
            account_id: "30",
            account_name: "Account Thirty",
            region: "eu-west-1",
            service: "RDS",
            resource: "arn:aws:rds:db/1",
            tags: {},
          },
        ],
        loading: false,
        error: null
      }}>
        <Compliancechild />
      </CostContext.Provider>
    );

    // Should only show rows for account_id 10 and 30
    const rows = screen.getAllByTestId("table-row");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent("Account Ten");
    expect(rows[1]).toHaveTextContent("Account Thirty");
  });

  test("handles localStorage with string account IDs", () => {
    localStorage.setItem("account_ids", JSON.stringify(["10", "20"]));

    const dataWithStringIds = [
      {
        id: 1,
        account_id: 10, // Number, not string
        account_name: "Account Ten",
        region: "us-east-1",
        service: "EC2",
        resource: "arn:aws:ec2:instance/1",
        tags: { Name: "test" },
      },
      {
        id: 2,
        account_id: "20", // String
        account_name: "Account Twenty",
        region: "us-west-2",
        service: "S3",
        resource: "arn:aws:s3:::bucket1",
        tags: {},
      },
    ];

    render(
      <CostContext.Provider value={{ tagData: dataWithStringIds, loading: false, error: null }}>
        <Compliancechild />
      </CostContext.Provider>
    );

    const rows = screen.getAllByTestId("table-row");
    expect(rows).toHaveLength(2);
  });

  test("renders component title correctly", () => {
    localStorage.setItem("account_ids", JSON.stringify(["10"]));
    
    render(
      <CostContext.Provider value={{
        tagData: [
          {
            account_id: "10",
            account_name: "Account Ten",
            region: "us-east-1",
            service: "EC2",
            resource: "arn:aws:ec2:instance/1",
            tags: { Name: "srv1", Owner: "Alice", Project: "P1", Environment: "Prod" },
          },
        ],
        loading: false,
        error: null
      }}>
        <Compliancechild />
      </CostContext.Provider>
    );

    expect(screen.getByText("Resource Tag Compliance")).toBeInTheDocument();
  });

  test("handles pagination correctly", () => {
    const largeDataSet = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      account_id: String(i + 1),
      account_name: `Account ${i + 1}`,
      region: "us-east-1",
      service: "EC2",
      resource: `arn:aws:ec2:instance/${i + 1}`,
      tags: { Name: `instance${i + 1}` },
    }));

    localStorage.setItem("account_ids", JSON.stringify(Array.from({ length: 15 }, (_, i) => String(i + 1))));

    render(
      <CostContext.Provider value={{ tagData: largeDataSet, loading: false, error: null }}>
        <Compliancechild />
      </CostContext.Provider>
    );

    // Our mock implements pagination with pageSize: 10
    const rows = screen.getAllByTestId("table-row");
    expect(rows).toHaveLength(10);
  });

  test("filters by partially tagged status", async () => {
    localStorage.setItem("account_ids", JSON.stringify(["10", "20", "30"]));
    
    render(
      <CostContext.Provider value={{
        tagData: [
          {
            account_id: "10",
            account_name: "Account Ten",
            region: "us-east-1",
            service: "EC2",
            resource: "arn:aws:ec2:instance/1",
            tags: { Name: "srv1", Owner: "Alice", Project: "P1", Environment: "Prod" },
          },
          {
            account_id: "20",
            account_name: "Account Twenty",
            region: "us-west-2",
            service: "S3",
            resource: "arn:aws:s3:::bucket1",
            tags: { Name: "bucket1", Owner: "", Project: null, Environment: undefined },
          },
          {
            account_id: "30",
            account_name: "Account Thirty",
            region: "eu-west-1",
            service: "RDS",
            resource: "arn:aws:rds:db/1",
            tags: {},
          },
        ],
        loading: false,
        error: null
      }}>
        <Compliancechild />
      </CostContext.Provider>
    );

    const statusFilter = screen.getByTestId("filter-tags");
    fireEvent.change(statusFilter, { target: { value: "Partially Tagged" } });

    const rows = screen.getAllByTestId("table-row");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("Account Twenty");
  });

  test("filters by not tagged status", async () => {
    localStorage.setItem("account_ids", JSON.stringify(["10", "20", "30"]));
    
    render(
      <CostContext.Provider value={{
        tagData: [
          {
            account_id: "10",
            account_name: "Account Ten",
            region: "us-east-1",
            service: "EC2",
            resource: "arn:aws:ec2:instance/1",
            tags: { Name: "srv1", Owner: "Alice", Project: "P1", Environment: "Prod" },
          },
          {
            account_id: "20",
            account_name: "Account Twenty",
            region: "us-west-2",
            service: "S3",
            resource: "arn:aws:s3:::bucket1",
            tags: { Name: "bucket1", Owner: "", Project: null, Environment: undefined },
          },
          {
            account_id: "30",
            account_name: "Account Thirty",
            region: "eu-west-1",
            service: "RDS",
            resource: "arn:aws:rds:db/1",
            tags: {},
          },
        ],
        loading: false,
        error: null
      }}>
        <Compliancechild />
      </CostContext.Provider>
    );

    const statusFilter = screen.getByTestId("filter-tags");
    fireEvent.change(statusFilter, { target: { value: "Not Tagged" } });

    const rows = screen.getAllByTestId("table-row");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("Account Thirty");
  });

  test("handles localStorage with CSV format", () => {
    localStorage.setItem("account_ids", "10,20,30");
    
    render(
      <CostContext.Provider value={{
        tagData: [
          {
            account_id: "10",
            account_name: "Account Ten",
            region: "us-east-1",
            service: "EC2",
            resource: "arn:aws:ec2:instance/1",
            tags: { Name: "test" },
          },
          {
            account_id: "20",
            account_name: "Account Twenty",
            region: "us-west-2",
            service: "S3",
            resource: "arn:aws:s3:::bucket1",
            tags: {},
          },
        ],
        loading: false,
        error: null
      }}>
        <Compliancechild />
      </CostContext.Provider>
    );

    const rows = screen.getAllByTestId("table-row");
    expect(rows).toHaveLength(2);
  });

  test("handles localStorage with single string value", () => {
    localStorage.setItem("account_ids", "10");
    
    render(
      <CostContext.Provider value={{
        tagData: [
          {
            account_id: "10",
            account_name: "Account Ten",
            region: "us-east-1",
            service: "EC2",
            resource: "arn:aws:ec2:instance/1",
            tags: { Name: "test" },
          },
          {
            account_id: "20",
            account_name: "Account Twenty",
            region: "us-west-2",
            service: "S3",
            resource: "arn:aws:s3:::bucket1",
            tags: {},
          },
        ],
        loading: false,
        error: null
      }}>
        <Compliancechild />
      </CostContext.Provider>
    );

    const rows = screen.getAllByTestId("table-row");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("Account Ten");
  });

  test("handles localStorage with single number value", () => {
    localStorage.setItem("account_ids", "10");
    
    render(
      <CostContext.Provider value={{
        tagData: [
          {
            account_id: 10, // Number in data
            account_name: "Account Ten",
            region: "us-east-1",
            service: "EC2",
            resource: "arn:aws:ec2:instance/1",
            tags: { Name: "test" },
          },
        ],
        loading: false,
        error: null
      }}>
        <Compliancechild />
      </CostContext.Provider>
    );

    const rows = screen.getAllByTestId("table-row");
    expect(rows).toHaveLength(1);
  });

  test("handles localStorage with invalid JSON", () => {
    localStorage.setItem("account_ids", "{invalid json}");
    
    render(
      <CostContext.Provider value={{
        tagData: [
          {
            account_id: "10",
            account_name: "Account Ten",
            region: "us-east-1",
            service: "EC2",
            resource: "arn:aws:ec2:instance/1",
            tags: { Name: "test" },
          },
        ],
        loading: false,
        error: null
      }}>
        <Compliancechild />
      </CostContext.Provider>
    );

    // Should treat as CSV/single value and show no matching accounts
    expect(screen.getByText(/No matching accounts found/i)).toBeInTheDocument();
  });

  test("handles localStorage unavailable", () => {
    // Mock localStorage to throw an error
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = vi.fn(() => {
      throw new Error("localStorage unavailable");
    });

    render(
      <CostContext.Provider value={{
        tagData: [
          {
            account_id: "10",
            account_name: "Account Ten",
            region: "us-east-1",
            service: "EC2",
            resource: "arn:aws:ec2:instance/1",
            tags: { Name: "test" },
          },
        ],
        loading: false,
        error: null
      }}>
        <Compliancechild />
      </CostContext.Provider>
    );

    // Should show all data when localStorage is unavailable
    const rows = screen.getAllByTestId("table-row");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("Account Ten");

    // Restore original localStorage
    localStorage.getItem = originalGetItem;
  });

  test("returns all data when no stored account IDs", () => {
    localStorage.setItem("account_ids", JSON.stringify([]));
    
    render(
      <CostContext.Provider value={{
        tagData: [
          {
            account_id: "10",
            account_name: "Account Ten",
            region: "us-east-1",
            service: "EC2",
            resource: "arn:aws:ec2:instance/1",
            tags: { Name: "test" },
          },
          {
            account_id: "20",
            account_name: "Account Twenty",
            region: "us-west-2",
            service: "S3",
            resource: "arn:aws:s3:::bucket1",
            tags: {},
          },
        ],
        loading: false,
        error: null
      }}>
        <Compliancechild />
      </CostContext.Provider>
    );

    // Should show all data when no stored account IDs
    const rows = screen.getAllByTestId("table-row");
    expect(rows).toHaveLength(2);
  });

  test("filters by account name with string comparison", async () => {
    localStorage.setItem("account_ids", JSON.stringify(["10", "20"]));
    
    render(
      <CostContext.Provider value={{
        tagData: [
          {
            account_id: "10",
            account_name: "Account Ten",
            region: "us-east-1",
            service: "EC2",
            resource: "arn:aws:ec2:instance/1",
            tags: { Name: "test" },
          },
          {
            account_id: "20",
            account_name: "Account Twenty",
            region: "us-west-2",
            service: "S3",
            resource: "arn:aws:s3:::bucket1",
            tags: {},
          },
        ],
        loading: false,
        error: null
      }}>
        <Compliancechild />
      </CostContext.Provider>
    );

    const accountNameFilter = screen.getByTestId("filter-account_name");
    fireEvent.change(accountNameFilter, { target: { value: "Account Ten" } });

    const rows = screen.getAllByTestId("table-row");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveTextContent("Account Ten");
  });

  test("handles custom rowKey function", () => {
    localStorage.setItem("account_ids", JSON.stringify(["10", "20", "30"]));
    
    const tagData = [
      {
        // No id field, should use resource as key
        account_id: "10",
        account_name: "Account Ten",
        region: "us-east-1",
        service: "EC2",
        resource: "arn:aws:ec2:instance/1",
        tags: { Name: "test" },
      },
      {
        // Has id field, should use id as key
        id: "custom-id",
        account_id: "20",
        account_name: "Account Twenty",
        region: "us-west-2",
        service: "S3",
        resource: "arn:aws:s3:::bucket1",
        tags: {},
      },
      {
        // No id or resource, should use account_id-index as key
        account_id: "30",
        account_name: "Account Thirty",
        region: "eu-west-1",
        service: "RDS",
        tags: {},
      },
    ];

    render(
      <CostContext.Provider value={{ tagData, loading: false, error: null }}>
        <Compliancechild />
      </CostContext.Provider>
    );

    const rows = screen.getAllByTestId("table-row");
    expect(rows).toHaveLength(3);
    
    // Verify all rows are rendered correctly
    expect(rows[0]).toHaveTextContent("Account Ten");
    expect(rows[1]).toHaveTextContent("Account Twenty");
    expect(rows[2]).toHaveTextContent("Account Thirty");
  });
});
